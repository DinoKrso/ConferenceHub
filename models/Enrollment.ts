import mongoose from "mongoose"

const EnrollmentSchema = new mongoose.Schema({
  guestID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guest",
    required: [true, "Please provide a guest ID"],
  },
  conferenceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conference",
    required: [true, "Please provide a conference ID"],
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["free", "paypal", "paypal_test"],
    default: "free",
  },
  paymentId: {
    type: String,
    required: false,
  },
})

// Ensure a guest can only enroll once in a conference
EnrollmentSchema.index({ guestID: 1, conferenceID: 1 }, { unique: true })

export default mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema)
