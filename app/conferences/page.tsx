"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import ConferenceList from "@/components/conference-list"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function ConferencesPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search")
  const [initialSearchTerm, setInitialSearchTerm] = useState("")
  const { session, isUser } = useAuth()

  useEffect(() => {
    if (searchQuery) {
      setInitialSearchTerm(searchQuery)
    }
  }, [searchQuery])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Browse Conferences</h1>
          <p className="text-muted-foreground">Discover and register for upcoming professional conferences</p>
        </div>
        {/* Only show Create Conference button for organizers (users), not attendees */}
        {session && isUser && (
          <Button asChild>
            <Link href="/conferences/create">Create Conference</Link>
          </Button>
        )}
      </div>
      <ConferenceList initialSearchTerm={initialSearchTerm} />
    </div>
  )
}
