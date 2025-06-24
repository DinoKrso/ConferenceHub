import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Guest from "@/models/Guest"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { name, email, password, role, phoneNumber, captchaToken } = await req.json()

    // Validate input
    if (!name || !email || !password || !role || !captchaToken) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Verify hCaptcha
    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY || "",
        response: captchaToken,
      }),
    })

    const captchaResult = await captchaResponse.json()

    if (!captchaResult.success) {
      return NextResponse.json({ success: false, message: "Captcha verification failed" }, { status: 400 })
    }

    await dbConnect()

    // Check if email already exists in either User or Guest collection
    const existingUser = await User.findOne({ email })
    const existingGuest = await Guest.findOne({ email })

    if (existingUser || existingGuest) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 })
    }

    // Create new user based on role
    let newUser
    if (role === "user") {
      newUser = await User.create({
        name,
        email,
        password,
      })
    } else if (role === "guest") {
      newUser = await Guest.create({
        name,
        email,
        password,
        phoneNumber: phoneNumber || "",
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 })
    }

    // Send welcome email
    try {
      const emailTemplate = emailTemplates.userRegistration(name, role)
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
      console.log(`Welcome email sent to ${email}`)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Check your email for a welcome message.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
