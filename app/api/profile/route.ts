export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Guest from "@/models/Guest"
import Conference from "@/models/Conference"
import Enrollment from "@/models/Enrollment"

// Get user profile
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    let user
    let additionalData = {}

    if (session.user.role === "user") {
      user = await User.findById(session.user.id)

      // Get conference count for organizers
      const conferenceCount = await Conference.countDocuments({ createdBy: session.user.id })
      additionalData = { conferenceCount }
    } else {
      user = await Guest.findById(session.user.id)

      // Get attended conferences count for guests
      const attendedConferences = await Enrollment.countDocuments({ guestID: session.user.id })
      additionalData = { attendedConferences }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: session.user.role,
      phoneNumber: user.phoneNumber || "",
      profileImage: user.profileImage || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      company: user.company || "",
      jobTitle: user.jobTitle || "",
      createdAt: user.createdAt,
      ...additionalData,
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch profile" }, { status: 500 })
  }
}

// Update user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const updateData = await req.json()
    const { name, phoneNumber, bio, location, website, company, jobTitle } = updateData

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 })
    }

    await dbConnect()

    let user
    const fieldsToUpdate = {
      name: name.trim(),
      phoneNumber: phoneNumber || "",
      bio: bio || "",
      location: location || "",
      website: website || "",
      company: company || "",
      jobTitle: jobTitle || "",
    }

    if (session.user.role === "user") {
      user = await User.findByIdAndUpdate(session.user.id, fieldsToUpdate, { new: true, runValidators: true })
    } else {
      user = await Guest.findByIdAndUpdate(session.user.id, fieldsToUpdate, { new: true, runValidators: true })
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Get additional data
    let additionalData = {}
    if (session.user.role === "user") {
      const conferenceCount = await Conference.countDocuments({ createdBy: session.user.id })
      additionalData = { conferenceCount }
    } else {
      const attendedConferences = await Enrollment.countDocuments({ guestID: session.user.id })
      additionalData = { attendedConferences }
    }

    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: session.user.role,
      phoneNumber: user.phoneNumber || "",
      profileImage: user.profileImage || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      company: user.company || "",
      jobTitle: user.jobTitle || "",
      createdAt: user.createdAt,
      ...additionalData,
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
  }
}
