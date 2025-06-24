export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Guest from "@/models/Guest"

// Update user profile image
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { profileImage } = await req.json()

    if (!profileImage) {
      return NextResponse.json({ success: false, message: "Profile image URL is required" }, { status: 400 })
    }

    await dbConnect()

    let user
    if (session.user.role === "user") {
      user = await User.findByIdAndUpdate(session.user.id, { profileImage }, { new: true, runValidators: true })
    } else {
      user = await Guest.findByIdAndUpdate(session.user.id, { profileImage }, { new: true, runValidators: true })
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
    })
  } catch (error) {
    console.error("Error updating profile image:", error)
    return NextResponse.json({ success: false, message: "Failed to update profile image" }, { status: 500 })
  }
}
