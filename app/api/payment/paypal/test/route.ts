import { NextResponse } from "next/server"
import { getPayPalAccessToken } from "@/lib/paypal"

export async function GET() {
  try {
    console.log("🧪 Testing PayPal credentials...")

    // Check if environment variables exist
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const mode = process.env.PAYPAL_MODE || "sandbox"

    console.log("Environment check:", {
      clientIdExists: !!clientId,
      clientSecretExists: !!clientSecret,
      mode: mode,
      clientIdLength: clientId?.length,
      clientSecretLength: clientSecret?.length,
    })

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        message: "PayPal credentials not configured",
        details: {
          clientIdExists: !!clientId,
          clientSecretExists: !!clientSecret,
        },
      })
    }

    // Test getting access token
    const accessToken = await getPayPalAccessToken()

    return NextResponse.json({
      success: true,
      message: "PayPal credentials are valid",
      details: {
        mode: mode,
        tokenReceived: !!accessToken,
        tokenLength: accessToken?.length,
      },
    })
  } catch (error) {
    console.error("❌ PayPal test failed:", error)
    return NextResponse.json({
      success: false,
      message: "PayPal test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
