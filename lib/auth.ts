import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Guest from "@/models/Guest"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "user-login",
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password")
        }

        await dbConnect()

        // First, try to find the user in the User collection (organizers)
        let user = await User.findOne({ email: credentials.email }).select("+password")
        let userRole = "user"

        // If not found in User collection, try Guest collection (attendees)
        if (!user) {
          user = await Guest.findOne({ email: credentials.email }).select("+password")
          userRole = "guest"
        }

        if (!user) {
          throw new Error("Invalid email or password")
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(credentials.password, user.password)

        if (!isMatch) {
          throw new Error("Invalid email or password")
        }

        // Return user with automatically detected role
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: userRole,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
