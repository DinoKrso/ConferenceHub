import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Conference from "@/models/Conference"

// Cancel an enrollment
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "guest") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if enrollment exists and belongs to the guest
    const enrollment = await Enrollment.findById(id)

    if (!enrollment) {
      return NextResponse.json({ success: false, message: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.guestID.toString() !== session.user.id) {
      return NextResponse.json({ success: false, message: "Not authorized to cancel this enrollment" }, { status: 403 })
    }

    // Delete enrollment
    await Enrollment.findByIdAndDelete(id)

    // Update conference attendees count
    await Conference.findByIdAndUpdate(enrollment.conferenceID, { $inc: { attendees: -1 } })

    return NextResponse.json({ success: true, message: "Enrollment cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling enrollment:", error)
    return NextResponse.json({ success: false, message: "Failed to cancel enrollment" }, { status: 500 })
  }
}
