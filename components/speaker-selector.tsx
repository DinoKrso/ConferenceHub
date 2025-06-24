"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Speaker {
  _id: string
  name: string
  surname: string
}

interface SpeakerSelectorProps {
  speakers: Speaker[]
  selectedSpeakers: string[]
  onSpeakersChange: (speakerIds: string[]) => void
  onSpeakersListUpdate: (speakers: Speaker[]) => void
}

export function SpeakerSelector({
  speakers = [], // Default to empty array
  selectedSpeakers = [], // Default to empty array
  onSpeakersChange,
  onSpeakersListUpdate,
}: SpeakerSelectorProps) {
  const [newSpeakerName, setNewSpeakerName] = useState("")
  const [newSpeakerSurname, setNewSpeakerSurname] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleSelectExistingSpeaker = (speakerId: string) => {
    if (!selectedSpeakers.includes(speakerId)) {
      onSpeakersChange([...selectedSpeakers, speakerId])
    }
  }

  const handleRemoveSpeaker = (speakerId: string) => {
    onSpeakersChange(selectedSpeakers.filter((id) => id !== speakerId))
  }

  const createSpeaker = async (name: string, surname: string) => {
    try {
      console.log("Creating speaker:", { name, surname })

      const response = await fetch("/api/speakers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          bio: "",
          profileImage: "",
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response not ok:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        const newSpeaker = data.data
        const updatedSpeakers = [...speakers, newSpeaker]
        onSpeakersListUpdate(updatedSpeakers)
        onSpeakersChange([...selectedSpeakers, newSpeaker._id])
        setError("")
        return true
      } else {
        const errorMessage = data.message || data.error || "Unknown error"
        console.error("API returned error:", errorMessage)
        setError(errorMessage)
        return false
      }
    } catch (error) {
      console.error("Error creating speaker:", error)
      const errorMessage = error instanceof Error ? error.message : "Network error"
      setError(`Failed to create speaker: ${errorMessage}`)
      return false
    }
  }

  const handleCreateNewSpeaker = async () => {
    if (!newSpeakerName.trim() || !newSpeakerSurname.trim()) {
      setError("Both first name and last name are required")
      return
    }

    setIsCreating(true)
    setError("")

    const success = await createSpeaker(newSpeakerName, newSpeakerSurname)

    if (success) {
      setNewSpeakerName("")
      setNewSpeakerSurname("")
      setIsAddingNew(false)
    }

    setIsCreating(false)
  }

  const handleQuickAdd = async (fullName: string) => {
    const nameParts = fullName.trim().split(" ")
    if (nameParts.length < 2) {
      setError("Please enter both first and last name (e.g., 'John Doe')")
      return
    }

    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ")

    // Check if speaker already exists
    const existingSpeaker = speakers.find(
      (s) => s.name.toLowerCase() === firstName.toLowerCase() && s.surname.toLowerCase() === lastName.toLowerCase(),
    )

    if (existingSpeaker) {
      if (!selectedSpeakers.includes(existingSpeaker._id)) {
        onSpeakersChange([...selectedSpeakers, existingSpeaker._id])
      }
      setError("")
      return
    }

    setIsCreating(true)
    setError("")

    await createSpeaker(firstName, lastName)
    setIsCreating(false)
  }

  // Filter available speakers (those not already selected)
  const availableSpeakers = speakers.filter((speaker) => !selectedSpeakers.includes(speaker._id))

  return (
    <div className="space-y-2">
      <Label>Speakers</Label>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Quick Add Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type speaker name (e.g., 'John Doe') and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              const target = e.target as HTMLInputElement
              if (target.value.trim()) {
                handleQuickAdd(target.value)
                target.value = ""
              }
            }
          }}
          disabled={isCreating}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsAddingNew(!isAddingNew)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Existing Speakers Dropdown */}
      {availableSpeakers.length > 0 && (
        <Select onValueChange={handleSelectExistingSpeaker} disabled={isCreating}>
          <SelectTrigger>
            <SelectValue placeholder="Or select from existing speakers" />
          </SelectTrigger>
          <SelectContent>
            {availableSpeakers.map((speaker) => (
              <SelectItem key={speaker._id} value={speaker._id}>
                {speaker.name} {speaker.surname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Add New Speaker Form */}
      {isAddingNew && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Add New Speaker</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="First name"
              value={newSpeakerName}
              onChange={(e) => setNewSpeakerName(e.target.value)}
              disabled={isCreating}
            />
            <Input
              placeholder="Last name"
              value={newSpeakerSurname}
              onChange={(e) => setNewSpeakerSurname(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCreateNewSpeaker}
              disabled={!newSpeakerName.trim() || !newSpeakerSurname.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Add Speaker"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingNew(false)
                setNewSpeakerName("")
                setNewSpeakerSurname("")
                setError("")
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Selected Speakers */}
      {selectedSpeakers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedSpeakers.map((speakerId) => {
            const speaker = speakers.find((s) => s._id === speakerId)
            return (
              speaker && (
                <Badge key={speakerId} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  {speaker.name} {speaker.surname}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveSpeaker(speakerId)} />
                </Badge>
              )
            )
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Type a speaker's full name and press Enter to quickly add them, or use the dropdown to select existing speakers.
        {isCreating && " Creating speaker..."}
      </p>
    </div>
  )
}
