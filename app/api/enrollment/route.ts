/**
 * Conference enrollment API
 *
 * Note: This implementation allows users to register for conferences without payment.
 * Payment processing will be added in a future update.
 */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Conference from "@/models/Conference"
import Guest from "@/models/Guest"
import { sendEmail, emailTemplates } from "@/lib/email"

// Get enrollments for the current guest
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "guest") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const enrollments = await Enrollment.find({ guestID: session.user.id }).populate({
      path: "conferenceID",
      select: "title description startDate endDate location image",
      populate: { path: "category", select: "name" },
    })

    return NextResponse.json({ success: true, data: enrollments })
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch enrollments" }, { status: 500 })
  }
}

// Create a new enrollment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "guest") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { conferenceID } = body

    if (!conferenceID) {
      return NextResponse.json({ success: false, message: "Conference ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if conference exists and get full details
    const conference = await Conference.findById(conferenceID).populate("category", "name")

    if (!conference) {
      return NextResponse.json({ success: false, message: "Conference not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      guestID: session.user.id,
      conferenceID,
    })

    if (existingEnrollment) {
      return NextResponse.json({ success: false, message: "Already enrolled in this conference" }, { status: 400 })
    }

    // Check if conference is full
    if (conference.attendees >= conference.maxAttendees) {
      return NextResponse.json({ success: false, message: "Conference is full" }, { status: 400 })
    }

    // Get user details for email
    const user = await Guest.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      guestID: session.user.id,
      conferenceID,
      status: "confirmed",
    })

    // Update conference attendees count
    await Conference.findByIdAndUpdate(conferenceID, { $inc: { attendees: 1 } })

    // Send confirmation email
    try {
      const emailTemplate = emailTemplates.conferenceRegistration(user.name, conference)
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
      console.log(`Conference registration email sent to ${user.email}`)
    } catch (emailError) {
      console.error("Failed to send conference registration email:", emailError)
      // Don't fail the enrollment if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully registered for the conference! Check your email for confirmation details.",
        data: enrollment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating enrollment:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create enrollment",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
