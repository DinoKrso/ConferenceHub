export async function uploadToImgbb(file: File): Promise<string> {
  const API_KEY = process.env.IMGBB_API_KEY || "79bf2c16af0f4e0a430b30542a080bcb"

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file")
  }

  // Validate file size (max 32MB for ImgBB)
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("Image size must be less than 32MB")
  }

  const formData = new FormData()
  formData.append("image", file)

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || "Image upload failed")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || "Image upload failed")
    }

    return data.data.url as string // direct image URL
  } catch (error) {
    console.error("ImgBB upload error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to upload image")
  }
}

// Helper function to validate image files
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "Please select a valid image file" }
  }

  if (file.size > 32 * 1024 * 1024) {
    return { isValid: false, error: "Image size must be less than 32MB" }
  }

  // Check for common image formats
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Please select a JPEG, PNG, GIF, or WebP image" }
  }

  return { isValid: true }
}
