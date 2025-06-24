export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Guest from "@/models/Guest"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    console.log("=== Enrollment Check API Called ===")

    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session user email:", session?.user?.email)

    if (!session) {
      console.log("No session found")
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
          isRegistered: false,
        },
        { status: 401 },
      )
    }

    const resolvedParams = await params
    const conferenceId = resolvedParams.id
    console.log("Checking registration for conference ID:", conferenceId)

    await dbConnect()
    console.log("Database connected")

    // First, try to find enrollment by current session user ID
    let enrollment = await Enrollment.findOne({
      conferenceID: conferenceId,
      guestID: session.user.id,
    })

    console.log("Enrollment by session ID:", enrollment ? "FOUND" : "NOT FOUND")

    // If not found by session ID, try to find by email
    if (!enrollment && session.user.email) {
      console.log("Trying to find user by email:", session.user.email)

      // Find the guest by email
      const guest = await Guest.findOne({ email: session.user.email })
      console.log("Guest found by email:", guest ? "FOUND" : "NOT FOUND")

      if (guest) {
        console.log("Guest ID from email lookup:", guest._id)

        // Try to find enrollment with the guest ID from email lookup
        enrollment = await Enrollment.findOne({
          conferenceID: conferenceId,
          guestID: guest._id,
        })

        console.log("Enrollment by email-based guest ID:", enrollment ? "FOUND" : "NOT FOUND")
      }
    }

    const isRegistered = !!enrollment

    console.log("Final registration status:", isRegistered ? "REGISTERED" : "NOT REGISTERED")

    return NextResponse.json({
      success: true,
      isRegistered,
      enrollment: enrollment || null,
      debug: {
        conferenceId,
        sessionUserId: session.user.id,
        sessionUserEmail: session.user.email,
        foundEnrollment: !!enrollment,
      },
    })
  } catch (error) {
    console.error("Error in enrollment check API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
        isRegistered: false,
      },
      { status: 500 },
    )
  }
}
