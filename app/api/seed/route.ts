import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Guest from "@/models/Guest"
import Category from "@/models/Category"
import Conference from "@/models/Conference"
import Speaker from "@/models/Speaker"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await dbConnect()

    // Clear existing data
    await User.deleteMany({})
    await Guest.deleteMany({})
    await Category.deleteMany({})
    await Conference.deleteMany({})
    await Speaker.deleteMany({})

    // Create test user (conference organizer)
    const hashedPassword = await bcrypt.hash("password123", 10)

    const user = await User.create({
      name: "Conference Organizer",
      email: "organizer@example.com",
      password: hashedPassword,
    })

    // Create test guest
    const guest = await Guest.create({
      name: "Conference Attendee",
      email: "attendee@example.com",
      password: hashedPassword,
      phoneNumber: "123-456-7890",
    })

    // Create categories
    const categories = await Category.insertMany([
      { name: "IT" },
      { name: "Security" },
      { name: "Programming" },
      { name: "Data Science" },
      { name: "Design" },
    ])

    // Create speakers
    const speakers = await Speaker.insertMany([
      {
        name: "John",
        surname: "Smith",
        bio: "Expert in cybersecurity with 10+ years of experience",
        profileImage: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Sarah",
        surname: "Johnson",
        bio: "AI researcher and machine learning specialist",
        profileImage: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Michael",
        surname: "Chen",
        bio: "Full-stack developer and open source contributor",
        profileImage: "/placeholder.svg?height=200&width=200",
      },
    ])

    // Create conferences
    const conferences = await Conference.insertMany([
      {
        title: "Web Development Summit 2025",
        description:
          "A comprehensive conference covering frontend, backend, and full-stack development with workshops on the latest web technologies.",
        category: categories[2]._id, // Programming
        hashTags: ["webdev", "javascript", "react", "nodejs"],
        startDate: new Date("2025-06-15"),
        endDate: new Date("2025-06-17"),
        location: "Chicago, IL",
        image: "/placeholder.svg?height=400&width=800",
        createdBy: user._id,
        speakersID: [speakers[2]._id],
        attendees: 0,
      },
      {
        title: "Cybersecurity Conference 2025",
        description:
          "The premier cybersecurity conference bringing together security professionals, researchers, and policy makers to address the latest threats and solutions.",
        category: categories[1]._id, // Security
        hashTags: ["cybersecurity", "hacking", "infosec", "zerotrust"],
        startDate: new Date("2025-04-10"),
        endDate: new Date("2025-04-12"),
        location: "Washington, DC",
        image: "/placeholder.svg?height=400&width=800",
        createdBy: user._id,
        speakersID: [speakers[0]._id],
        attendees: 0,
      },
      {
        title: "AI Innovation Forum",
        description:
          "Explore the cutting edge of artificial intelligence and machine learning with researchers and practitioners from around the world.",
        category: categories[3]._id, // Data Science
        hashTags: ["ai", "machinelearning", "deeplearning", "nlp"],
        startDate: new Date("2025-05-20"),
        endDate: new Date("2025-05-22"),
        location: "Boston, MA",
        image: "/placeholder.svg?height=400&width=800",
        createdBy: user._id,
        speakersID: [speakers[1]._id],
        attendees: 0,
      },
    ])

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      testAccounts: {
        organizer: {
          email: "organizer@example.com",
          password: "password123",
          role: "user",
        },
        attendee: {
          email: "attendee@example.com",
          password: "password123",
          role: "guest",
        },
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, message: "Failed to seed database" }, { status: 500 })
  }
}
