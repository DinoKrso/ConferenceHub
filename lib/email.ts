import { Resend } from "resend" 

const resend = new Resend("re_S1Do9GCq_LwzhrBm8zeNLBfEqh7AL86G3")

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: "Conference Hub <onboarding@resend.dev>",
      to,
      subject,
      html,
    })

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Email templates
export const emailTemplates = {
  userRegistration: (name: string, role: string) => ({
    subject: "Welcome to Conference Hub!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Conference Hub</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .role-badge { background: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Conference Hub!</h1>
              <p>Your account has been successfully created</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for joining Conference Hub. Your account has been created successfully as a <span class="role-badge">${role === "user" ? "Conference Organizer" : "Conference Attendee"}</span>.</p>
              
              ${
                role === "user"
                  ? `
                <h3>As a Conference Organizer, you can:</h3>
                <ul>
                  <li>Create and manage conferences</li>
                  <li>Track attendee registrations</li>
                  <li>Manage speakers and schedules</li>
                  <li>Access detailed analytics</li>
                </ul>
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
              `
                  : `
                <h3>As a Conference Attendee, you can:</h3>
                <ul>
                  <li>Browse upcoming conferences</li>
                  <li>Register for events</li>
                  <li>View your conference schedule</li>
                  <li>Connect with other attendees</li>
                </ul>
                <a href="${process.env.NEXTAUTH_URL}/conferences" class="button">Browse Conferences</a>
              `
              }
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Conference Hub Team</p>
              <p><small>This email was sent from Conference Hub. If you didn't create this account, please ignore this email.</small></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  conferenceRegistration: (userName: string, conference: any) => ({
    subject: `Registration Confirmed: ${conference.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conference Registration Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .conference-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .detail-value { color: #111827; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .price { font-size: 18px; font-weight: bold; color: #059669; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Registration Confirmed!</h1>
              <p>You're all set for the conference</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Great news! Your registration for the following conference has been confirmed:</p>
              
              <div class="conference-card">
                <h3>${conference.title}</h3>
                <div class="detail-row">
                  <span class="detail-label">📅 Date:</span>
                  <span class="detail-value">${new Date(conference.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} - ${new Date(conference.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📍 Location:</span>
                  <span class="detail-value">${conference.location}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">💰 Price:</span>
                  <span class="detail-value price">${conference.ticketPrice === 0 ? "Free" : `${conference.currency} ${conference.ticketPrice}`}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🏷️ Category:</span>
                  <span class="detail-value">${conference.category?.name || "General"}</span>
                </div>
              </div>

              <h3>What's Next?</h3>
              <ul>
                <li>Save the date in your calendar</li>
                <li>Check your email for any updates about the conference</li>
                <li>Prepare any materials you might need</li>
                <li>Join our community to connect with other attendees</li>
              </ul>

              <a href="${process.env.NEXTAUTH_URL}/conferences/${conference._id}" class="button">View Conference Details</a>
              
              <p><strong>Important:</strong> Please keep this email as your registration confirmation. You may need to present it at the event.</p>
            </div>
            <div class="footer">
              <p>Looking forward to seeing you at the conference!<br>The Conference Hub Team</p>
              <p><small>If you need to cancel your registration, please visit your dashboard or contact support.</small></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}
