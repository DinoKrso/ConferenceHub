import mongoose from "mongoose"

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a category name"],
    unique: true,
    trim: true,
    maxlength: [50, "Category name cannot be more than 50 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Category || mongoose.model("Category", CategorySchema)
