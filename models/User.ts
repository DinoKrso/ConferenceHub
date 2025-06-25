import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password should be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    maxlength: [500, "Bio cannot be more than 500 characters"],
    default: "",
  },
  location: {
    type: String,
    maxlength: [100, "Location cannot be more than 100 characters"],
    default: "",
  },
  website: {
    type: String,
    maxlength: [200, "Website URL cannot be more than 200 characters"],
    default: "",
  },
  company: {
    type: String,
    maxlength: [100, "Company name cannot be more than 100 characters"],
    default: "",
  },
  jobTitle: {
    type: String,
    maxlength: [100, "Job title cannot be more than 100 characters"],
    default: "",
  },
})

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to check if password matches
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.models.User || mongoose.model("User", UserSchema)
