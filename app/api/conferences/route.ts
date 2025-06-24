export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Conference from "@/models/Conference"
import Category from "@/models/Category"
import Speaker from "@/models/Speaker"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    console.log("Starting conference fetch...")
    await dbConnect()
    console.log("Database connected successfully")

    // Ensure Speaker model is registered
    console.log("Speaker model registered:", !!Speaker)

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const hashtag = searchParams.get("hashtag")

    let query = {}

    if (category) {
      console.log("Filtering by category:", category)
      const categoryDoc = await Category.findOne({ name: category })
      if (categoryDoc) {
        query = { ...query, category: categoryDoc._id }
      }
    }

    if (hashtag) {
      console.log("Filtering by hashtag:", hashtag)
      query = { ...query, hashTags: hashtag }
    }

    console.log("Query:", query)

    // Fetch conferences with proper speaker population
    const conferences = await Conference.find(query)
      .populate("category", "name")
      .populate("createdBy", "name email")
      .populate("speakersID", "name surname bio profileImage")
      .sort({ startDate: 1 })

    console.log("Conferences found:", conferences.length)

    // Convert to plain objects
    const conferencesData = conferences.map((conf) => {
      const confObj = conf.toObject()
      return confObj
    })

    console.log("Successfully processed conferences")
    return NextResponse.json({ success: true, data: conferencesData })
  } catch (error) {
    console.error("Detailed error fetching conferences:", error)
    console.error("Error name:", error.name)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch conferences",
        error: error.message,
        errorName: error.name,
      },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const {
      title,
      description,
      category,
      hashTags,
      startDate,
      endDate,
      location,
      image,
      speakersID,
      ticketPrice,
      currency,
      maxAttendees,
    } = await req.json()

    // Validate input
    if (
      !title ||
      !description ||
      !category ||
      !startDate ||
      !endDate ||
      !location ||
      ticketPrice === undefined ||
      !maxAttendees
    ) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Find or create category
    let categoryDoc = await Category.findOne({ name: category })

    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category })
    }

    const conference = await Conference.create({
      title,
      description,
      category: categoryDoc._id,
      hashTags: hashTags || [],
      startDate,
      endDate,
      location,
      image: image || "",
      speakersID: speakersID || [],
      ticketPrice: ticketPrice || 0,
      currency: currency || "USD",
      maxAttendees: maxAttendees || 100,
      createdBy: session.user.id,
    })

    return NextResponse.json({ success: true, data: conference }, { status: 201 })
  } catch (error) {
    console.error("Error creating conference:", error)
    return NextResponse.json({ success: false, message: "Failed to create conference" }, { status: 500 })
  }
}
