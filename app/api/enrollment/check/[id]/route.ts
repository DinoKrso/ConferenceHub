import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "guest") {
      return NextResponse.json({ success: false, isRegistered: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { id } = params // id is conferenceID
    const guestID = session.user.id

    const enrollment = await Enrollment.findOne({ guestID, conferenceID: id })

    return NextResponse.json({ success: true, isRegistered: !!enrollment })
  } catch (error: any) {
    console.error("Error checking enrollment:", error)
    return NextResponse.json({ success: false, isRegistered: false, message: error.message }, { status: 500 })
  }
}
