import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    // Get all enrollments for debugging
    const allEnrollments = await Enrollment.find({}).limit(20)
    const userEnrollments = await Enrollment.find({ guestID: session.user.id })

    return NextResponse.json({
      success: true,
      data: {
        currentUserId: session.user.id,
        currentUserEmail: session.user.email,
        totalEnrollments: allEnrollments.length,
        userEnrollments: userEnrollments.length,
        allEnrollments: allEnrollments.map((e) => ({
          _id: e._id,
          conferenceID: e.conferenceID,
          guestID: e.guestID,
          enrollmentDate: e.enrollmentDate,
        })),
        userEnrollmentDetails: userEnrollments.map((e) => ({
          _id: e._id,
          conferenceID: e.conferenceID,
          guestID: e.guestID,
          enrollmentDate: e.enrollmentDate,
        })),
      },
    })
  } catch (error) {
    console.error("Error in debug API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
