import mongoose from "mongoose"

const ConferenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Please provide a category"],
  },
  hashTags: [
    {
      type: String,
      trim: true,
    },
  ],
  attendees: {
    type: Number,
    default: 0,
  },
  speakersID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Speaker",
    },
  ],
  startDate: {
    type: Date,
    required: [true, "Please provide a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide an end date"],
  },
  location: {
    type: String,
    required: [true, "Please provide a location"],
  },
  image: {
    type: String,
    default: "",
  },
  ticketPrice: {
    type: Number,
    required: [true, "Please provide a ticket price"],
    min: [0, "Ticket price cannot be negative"],
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
  },
  maxAttendees: {
    type: Number,
    required: [true, "Please provide maximum number of attendees"],
    min: [1, "Maximum attendees must be at least 1"],
    default: 100,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide a user"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Conference || mongoose.model("Conference", ConferenceSchema)
