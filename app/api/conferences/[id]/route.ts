import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Conference from "@/models/Conference"
import Category from "@/models/Category"
import Speaker from "@/models/Speaker"

// Get a single conference by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await dbConnect()

    // Ensure Speaker model is registered
    console.log("Speaker model registered:", !!Speaker)

    const conference = await Conference.findById(id).populate("category", "name").populate("createdBy", "name email")

    if (!conference) {
      return NextResponse.json({ success: false, message: "Conference not found" }, { status: 404 })
    }

    // Manually populate speakers to avoid schema error
    const conferenceData = conference.toObject()

    if (conferenceData.speakersID && conferenceData.speakersID.length > 0) {
      try {
        const speakers = await Speaker.find({ _id: { $in: conferenceData.speakersID } })
        conferenceData.speakersID = speakers
      } catch (speakerError) {
        console.log("Speaker population error:", speakerError)
        conferenceData.speakersID = []
      }
    } else {
      conferenceData.speakersID = []
    }

    return NextResponse.json({ success: true, data: conferenceData })
  } catch (error) {
    console.error("Error fetching conference:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch conference" }, { status: 500 })
  }
}

// Update a conference
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "user") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const updateData = await req.json()

    await dbConnect()

    // Check if conference exists and belongs to the user
    const conference = await Conference.findById(id)

    if (!conference) {
      return NextResponse.json({ success: false, message: "Conference not found" }, { status: 404 })
    }

    if (conference.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, message: "Not authorized to update this conference" }, { status: 403 })
    }

    // Handle category - find or create if it's a string
    if (updateData.category) {
      if (typeof updateData.category === "string") {
        let categoryDoc = await Category.findOne({ name: updateData.category })

        if (!categoryDoc) {
          categoryDoc = await Category.create({ name: updateData.category })
        }

        updateData.category = categoryDoc._id
      }
    }

    // Update conference
    const updatedConference = await Conference.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("category", "name")
      .populate("createdBy", "name email")

    // Manually populate speakers
    const conferenceData = updatedConference.toObject()

    if (conferenceData.speakersID && conferenceData.speakersID.length > 0) {
      try {
        const speakers = await Speaker.find({ _id: { $in: conferenceData.speakersID } })
        conferenceData.speakersID = speakers
      } catch (speakerError) {
        console.log("Speaker population error:", speakerError)
        conferenceData.speakersID = []
      }
    } else {
      conferenceData.speakersID = []
    }

    return NextResponse.json({ success: true, data: conferenceData })
  } catch (error) {
    console.error("Error updating conference:", error)
    return NextResponse.json({ success: false, message: "Failed to update conference" }, { status: 500 })
  }
}

// Delete a conference
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "user") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if conference exists and belongs to the user
    const conference = await Conference.findById(id)

    if (!conference) {
      return NextResponse.json({ success: false, message: "Conference not found" }, { status: 404 })
    }

    if (conference.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, message: "Not authorized to delete this conference" }, { status: 403 })
    }

    await Conference.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "Conference deleted successfully" })
  } catch (error) {
    console.error("Error deleting conference:", error)
    return NextResponse.json({ success: false, message: "Failed to delete conference" }, { status: 500 })
  }
}
