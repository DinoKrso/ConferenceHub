import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth"

// In NextAuth.js v5, NextAuth(config) returns an object.
// You need to destructure the handlers from it.
const { handlers } = NextAuth(authOptions)

// Then export the specific handlers.
export const { GET, POST } = handlers

// You can also export other utilities if needed, like:
// export const { auth, signIn, signOut } = NextAuth(authOptions)
// And then use them elsewhere, but for the route handlers, GET and POST are key.
