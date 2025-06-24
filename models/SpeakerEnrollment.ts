import mongoose from "mongoose"

const SpeakerEnrollmentSchema = new mongoose.Schema({
  speakerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Speaker",
    required: [true, "Please provide a speaker ID"],
  },
  conferenceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conference",
    required: [true, "Please provide a conference ID"],
  },
  topic: {
    type: String,
    required: [true, "Please provide a topic"],
    maxlength: [200, "Topic cannot be more than 200 characters"],
  },
  scheduledTime: {
    type: Date,
  },
  duration: {
    type: Number, // Duration in minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Ensure a speaker can only be enrolled once for a specific conference
SpeakerEnrollmentSchema.index({ speakerID: 1, conferenceID: 1 }, { unique: true })

export default mongoose.models.SpeakerEnrollment || mongoose.model("SpeakerEnrollment", SpeakerEnrollmentSchema)
