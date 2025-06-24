export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Conference from "@/models/Conference"

// Get conferences created by the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "user") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const conferences = await Conference.find({ createdBy: session.user.id })
      .populate("category", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: conferences })
  } catch (error) {
    console.error("Error fetching user conferences:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch conferences" }, { status: 500 })
  }
}
