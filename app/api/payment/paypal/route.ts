import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createPayPalPayment } from "@/lib/paypal"
import dbConnect from "@/lib/mongodb"
import Conference from "@/models/Conference"

export async function POST(req: Request) {
  try {
    console.log("PayPal payment API called")

    const session = await getServerSession(authOptions)
    console.log("Session:", session?.user?.email)

    if (!session?.user) {
      console.log("No session found")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    console.log("Request body:", body)

    const { conferenceId } = body

    if (!conferenceId) {
      console.log("No conference ID provided")
      return NextResponse.json({ success: false, message: "Conference ID is required" }, { status: 400 })
    }

    console.log("Connecting to database...")
    await dbConnect()

    console.log("Finding conference:", conferenceId)
    const conference = await Conference.findById(conferenceId)

    if (!conference) {
      console.log("Conference not found")
      return NextResponse.json({ success: false, message: "Conference not found" }, { status: 404 })
    }

    console.log("Conference found:", conference.title, "Price:", conference.ticketPrice)

    // Check environment variables
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.log("PayPal credentials missing")
      return NextResponse.json(
        {
          success: false,
          message: "PayPal configuration missing",
        },
        { status: 500 },
      )
    }

    console.log("Creating PayPal payment...")
    // Create PayPal payment using v1 API
    const paypalPayment = await createPayPalPayment(
      conference.ticketPrice,
      conference.currency || "USD",
      conferenceId,
      conference.title,
    )

    console.log("PayPal response:", paypalPayment)

    if (paypalPayment.id) {
      // Find the approval URL from the links array
      const approvalUrl = paypalPayment.links?.find((link: any) => link.rel === "approval_url")?.href

      console.log("Payment created successfully, approval URL:", approvalUrl)

      return NextResponse.json({
        success: true,
        paymentId: paypalPayment.id,
        approvalUrl: approvalUrl,
      })
    } else {
      console.log("Failed to create PayPal payment:", paypalPayment)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create PayPal payment",
          error: paypalPayment,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("PayPal payment creation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
