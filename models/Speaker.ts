import mongoose from "mongoose"

const SpeakerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    surname: {
      type: String,
      required: [true, "Surname is required"],
      trim: true,
    },
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for full name
SpeakerSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`
})

// Ensure virtual fields are serialized
SpeakerSchema.set("toJSON", {
  virtuals: true,
})

// Create indexes for better performance
SpeakerSchema.index({ name: 1, surname: 1 })

const Speaker = mongoose.models.Speaker || mongoose.model("Speaker", SpeakerSchema)

export default Speaker
