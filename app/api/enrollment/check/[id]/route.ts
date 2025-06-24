import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { id } = params

    const enrollment = await Enrollment.findById(id)

    if (!enrollment) {
      return NextResponse.json({ message: "Enrollment not found" }, { status: 404 })
    }

    return NextResponse.json(enrollment)
  } catch (error: any) {
    console.error("Error fetching enrollment:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
