export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Conference from "@/models/Conference"
import Guest from "@/models/Guest"

// Get attendees for a specific conference (only accessible by conference organizer)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "user") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if the conference exists and if the current user is the organizer
    const conference = await Conference.findById(id).select("createdBy title")
    
    if (!conference) {
      return NextResponse.json({ success: false, message: "Conference not found" }, { status: 404 })
    }

    // Check if the current user is the organizer of this conference
    if (conference.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, message: "Not authorized to view attendees for this conference" }, { status: 403 })
    }

    // Get all enrollments for this conference with guest details
    const enrollments = await Enrollment.find({ conferenceID: id })
      .populate({
        path: "guestID",
        select: "name email phoneNumber profileImage bio location company jobTitle",
      })
      .sort({ enrollmentDate: -1 }) // Most recent first

    // Transform the data to include relevant attendee information
    const attendees = enrollments.map(enrollment => ({
      _id: enrollment._id,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      paymentMethod: enrollment.paymentMethod,
      attendee: {
        _id: enrollment.guestID._id,
        name: enrollment.guestID.name,
        email: enrollment.guestID.email,
        phoneNumber: enrollment.guestID.phoneNumber,
        profileImage: enrollment.guestID.profileImage,
        bio: enrollment.guestID.bio,
        location: enrollment.guestID.location,
        company: enrollment.guestID.company,
        jobTitle: enrollment.guestID.jobTitle,
      }
    }))

    return NextResponse.json({ 
      success: true, 
      data: {
        conference: {
          _id: conference._id,
          title: conference.title
        },
        attendees,
        totalAttendees: attendees.length
      }
    })
  } catch (error) {
    console.error("Error fetching conference attendees:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch attendees" }, { status: 500 })
  }
}
