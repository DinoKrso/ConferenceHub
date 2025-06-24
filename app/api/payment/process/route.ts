import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Conference from "@/models/Conference"
import Guest from "@/models/Guest"
import { sendEmail, emailTemplates } from "@/lib/email"

// This is a simplified payment processing endpoint
// In a real application, you would integrate with payment providers like Stripe, PayPal, etc.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { conferenceId, amount, currency, paymentMethod, cardDetails, billingAddress } = await req.json()

    if (!conferenceId || !amount || !currency || !paymentMethod) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Get conference and user details for email
    const conference = await Conference.findById(conferenceId).populate("category", "name")
    const user = await Guest.findById(session.user.id)

    if (!conference || !user) {
      return NextResponse.json({ success: false, message: "Conference or user not found" }, { status: 404 })
    }

    // Validate payment method specific requirements
    if (paymentMethod === "card") {
      if (!cardDetails || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        return NextResponse.json({ success: false, message: "Missing card details" }, { status: 400 })
      }

      // Basic card number validation (remove spaces and check length)
      const cardNumber = cardDetails.number.replace(/\s/g, "")
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        return NextResponse.json({ success: false, message: "Invalid card number" }, { status: 400 })
      }

      // Basic expiry validation
      const [month, year] = cardDetails.expiry.split("/")
      const currentDate = new Date()
      const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1)

      if (expiryDate < currentDate) {
        return NextResponse.json({ success: false, message: "Card has expired" }, { status: 400 })
      }

      // CVV validation
      if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
        return NextResponse.json({ success: false, message: "Invalid CVV" }, { status: 400 })
      }
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real implementation, you would:
    // 1. Validate the payment details with your payment provider
    // 2. Process the payment (Stripe, PayPal, etc.)
    // 3. Handle success/failure responses
    // 4. Store payment records in your database
    // 5. Send confirmation emails
    // 6. Handle webhooks for payment status updates

    // For demo purposes, we'll simulate different success rates based on payment method
    let paymentSuccess = false
    let errorMessage = ""

    if (paymentMethod === "card") {
      // Simulate card payment with 90% success rate
      paymentSuccess = Math.random() > 0.1
      if (!paymentSuccess) {
        const errors = [
          "Card declined by issuer",
          "Insufficient funds",
          "Invalid card details",
          "Card expired",
          "Transaction limit exceeded",
        ]
        errorMessage = errors[Math.floor(Math.random() * errors.length)]
      }
    } else if (paymentMethod === "paypal") {
      // Simulate PayPal payment with 95% success rate
      paymentSuccess = Math.random() > 0.05
      if (!paymentSuccess) {
        const errors = [
          "PayPal account temporarily restricted",
          "Payment cancelled by user",
          "PayPal service temporarily unavailable",
        ]
        errorMessage = errors[Math.floor(Math.random() * errors.length)]
      }
    }

    if (paymentSuccess) {
      // Generate a mock payment ID
      const paymentId = `${paymentMethod}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Send payment confirmation email
      try {
        const emailTemplate = emailTemplates.conferenceRegistration(user.name, {
          ...conference.toObject(),
          paymentId,
          paymentMethod,
          paidAmount: amount,
        })

        // Enhance the email template for paid registrations
        const enhancedHtml = emailTemplate.html.replace(
          "<p><strong>Important:</strong>",
          `<div class="conference-card">
            <h3>💳 Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Payment ID:</span>
              <span class="detail-value">${paymentId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${paymentMethod.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-value price">${currency} ${amount}</span>
            </div>
          </div>
          <p><strong>Important:</strong>`,
        )

        await sendEmail({
          to: user.email,
          subject: `Payment Confirmed: ${conference.title}`,
          html: enhancedHtml,
        })
        console.log(`Payment confirmation email sent to ${user.email}`)
      } catch (emailError) {
        console.error("Failed to send payment confirmation email:", emailError)
        // Don't fail the payment if email fails
      }

      return NextResponse.json({
        success: true,
        message: `Payment processed successfully via ${paymentMethod}. Check your email for confirmation.`,
        paymentId,
        amount,
        currency,
        paymentMethod,
        transactionDate: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: errorMessage || `${paymentMethod} payment failed. Please try again.`,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Payment processing failed due to server error",
      },
      { status: 500 },
    )
  }
}
