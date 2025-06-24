"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import SpeakerCard from "@/components/speaker-card"

interface Speaker {
  _id: string
  name: string
  surname: string
  role?: string
  image?: string
  profileImage?: string
  bio?: string
}

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [filteredSpeakers, setFilteredSpeakers] = useState<Speaker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSpeakers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = speakers.filter(
        (speaker) =>
          `${speaker.name} ${speaker.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          speaker.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          speaker.bio?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredSpeakers(filtered)
    } else {
      setFilteredSpeakers(speakers)
    }
  }, [searchTerm, speakers])

  const fetchSpeakers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/speakers")

      if (!response.ok) {
        throw new Error("Failed to fetch speakers")
      }

      const data = await response.json()
      console.log("Speakers data:", data) // Debug log
      setSpeakers(data.speakers || [])
      setFilteredSpeakers(data.speakers || [])
    } catch (error) {
      console.error("Error fetching speakers:", error)
      setError("Failed to load speakers")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading speakers...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchSpeakers} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Conference Speakers</h1>
          <p className="text-muted-foreground">
            Learn from industry experts and thought leaders ({filteredSpeakers.length} speakers)
          </p>
        </div>
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search speakers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredSpeakers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No speakers found matching your search." : "No speakers available yet."}
          </p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSpeakers.map((speaker) => (
              <SpeakerCard
                key={speaker._id}
                id={speaker._id}
                name={speaker.name}
                surname={speaker.surname}
                role={speaker.role}
                image={speaker.image || speaker.profileImage}
                bio={speaker.bio}
              />
            ))}
          </div>

          {speakers.length > filteredSpeakers.length && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredSpeakers.length} of {speakers.length} speakers
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
