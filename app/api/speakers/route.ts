import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Speaker from "@/models/Speaker"

// Get all speakers
export async function GET(req: Request) {
  try {
    await dbConnect()

    const speakers = await Speaker.find().sort({ name: 1 }).lean()

    return NextResponse.json({
      success: true,
      speakers: speakers,
    })
  } catch (error) {
    console.error("Error fetching speakers:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch speakers",
        speakers: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Create a new speaker
export async function POST(req: Request) {
  try {
    console.log("POST /api/speakers - Starting speaker creation")

    // Parse request body
    let body
    try {
      body = await req.json()
      console.log("Request body:", body)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ success: false, message: "Invalid JSON in request body" }, { status: 400 })
    }

    const { name, surname, bio, profileImage, firstName, lastName } = body

    // Use name/surname or fallback to firstName/lastName
    const speakerName = name || firstName
    const speakerSurname = surname || lastName

    console.log("Processed speaker data:", { speakerName, speakerSurname, bio, profileImage })

    // Validate input
    if (!speakerName || !speakerSurname) {
      console.log("Validation failed: missing name or surname")
      return NextResponse.json({ success: false, message: "Name and surname are required" }, { status: 400 })
    }

    // Connect to database
    try {
      await dbConnect()
      console.log("Database connected successfully")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json({ success: false, message: "Database connection failed" }, { status: 500 })
    }

    // Check if speaker already exists
    try {
      const existingSpeaker = await Speaker.findOne({
        name: speakerName.trim(),
        surname: speakerSurname.trim(),
      })

      if (existingSpeaker) {
        console.log("Speaker already exists:", existingSpeaker)
        return NextResponse.json({ success: true, data: existingSpeaker })
      }
    } catch (findError) {
      console.error("Error checking for existing speaker:", findError)
      // Continue with creation even if check fails
    }

    // Create new speaker
    try {
      const speakerData = {
        name: speakerName.trim(),
        surname: speakerSurname.trim(),
        bio: bio || "",
        profileImage: profileImage || "",
      }

      console.log("Creating speaker with data:", speakerData)

      const speaker = await Speaker.create(speakerData)
      console.log("Speaker created successfully:", speaker)

      return NextResponse.json({ success: true, data: speaker }, { status: 201 })
    } catch (createError) {
      console.error("Error creating speaker:", createError)

      // Check if it's a validation error
      if (createError instanceof Error && createError.name === "ValidationError") {
        return NextResponse.json(
          { success: false, message: `Validation error: ${createError.message}` },
          { status: 400 },
        )
      }

      return NextResponse.json({ success: false, message: "Failed to create speaker in database" }, { status: 500 })
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/speakers:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
