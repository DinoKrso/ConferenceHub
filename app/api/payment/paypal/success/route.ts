import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executePayPalPayment } from "@/lib/paypal"
import dbConnect from "@/lib/mongodb"
import Conference from "@/models/Conference"
import Enrollment from "@/models/Enrollment"
import Guest from "@/models/Guest"

export async function GET(req: NextRequest) {
  try {
    console.log("PayPal success callback called")

    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get("paymentId")
    const payerId = searchParams.get("PayerID")
    const conferenceId = searchParams.get("conferenceId")

    console.log("URL params:", { paymentId, payerId, conferenceId })

    if (!paymentId || !payerId || !conferenceId) {
      console.log("Missing payment parameters")
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?error=missing_payment_params`,
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log("No session found")
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=unauthorized`)
    }

    try {
      console.log("Executing PayPal payment...")
      // Execute the PayPal payment
      const executedPayment = await executePayPalPayment(paymentId, payerId)

      if (executedPayment.state !== "approved") {
        console.log("Payment not approved:", executedPayment.state)
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?error=payment_not_approved`,
        )
      }

      console.log("Payment approved, registering user...")

      // Connect to database
      await dbConnect()

      // Find the conference
      const conference = await Conference.findById(conferenceId)
      if (!conference) {
        console.log("Conference not found")
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?error=conference_not_found`,
        )
      }

      // Get the current user's ID from session
      // const userId = session.user.id

      // Find the guest record by email to get the correct ID
      const guest = await Guest.findOne({ email: session.user.email })
      if (!guest) {
        console.log("Guest not found for email:", session.user.email)
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?error=user_not_found`)
      }

      // Check if user is already enrolled
      const existingEnrollment = await Enrollment.findOne({
        guestID: guest._id,
        conferenceID: conferenceId,
      })

      if (existingEnrollment) {
        console.log("User already enrolled")
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?success=already_registered`,
        )
      }

      // Create enrollment with correct guest ID
      const enrollment = new Enrollment({
        guestID: guest._id,
        conferenceID: conferenceId,
        enrollmentDate: new Date(),
        status: "confirmed",
        paymentStatus: "completed",
        paymentMethod: "paypal",
        paymentId: paymentId,
      })

      await enrollment.save()

      // Update conference attendee count (use the correct field name)
      await Conference.findByIdAndUpdate(conferenceId, {
        $inc: { attendees: 1 },
      })

      console.log("Registration successful")
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?success=payment_completed`)
    } catch (paypalError) {
      console.error("PayPal execution error:", paypalError)

      // If it's a compliance violation in sandbox, still register the user for testing
      if (
        paypalError instanceof Error &&
        paypalError.message.includes("COMPLIANCE_VIOLATION") &&
        process.env.PAYPAL_MODE === "sandbox"
      ) {
        console.log("⚠️ Handling compliance violation as test success")

        await dbConnect()

        const guest = await Guest.findOne({ email: session.user.email })
        if (guest) {
          const existingEnrollment = await Enrollment.findOne({
            guestID: guest._id,
            conferenceID: conferenceId,
          })

          if (!existingEnrollment) {
            const enrollment = new Enrollment({
              guestID: guest._id,
              conferenceID: conferenceId,
              enrollmentDate: new Date(),
              status: "confirmed",
              paymentStatus: "completed",
              paymentMethod: "paypal_test",
              paymentId: paymentId,
            })

            await enrollment.save()
          }
        }

        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?success=test_payment_completed`,
        )
      }

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?error=payment_execution_failed`,
      )
    }
  } catch (error) {
    console.error("PayPal success callback error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/conferences/${conferenceId}?error=processing_failed`)
  }
}
