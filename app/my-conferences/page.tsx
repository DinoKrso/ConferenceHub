"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Enrollment {
  _id: string
  conferenceID: {
    _id: string
    title: string
    description: string
    startDate: string
    endDate: string
    location: string
    image: string
    category: {
      name: string
    }
  }
  status: string
  enrollmentDate: string
}

export default function MyConferencesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const { session, isGuest } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!session || !isGuest) {
      setShouldRedirect(true)
    } else {
      setShouldRedirect(false)
    }
  }, [session, isGuest])

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/login")
    }
  }, [shouldRedirect, router])

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await fetch("/api/enrollment")
        const data = await response.json()

        if (data.success) {
          setEnrollments(data.data)
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!shouldRedirect) {
      fetchEnrollments()
    }
  }, [shouldRedirect])

  const handleCancelEnrollment = async () => {
    if (!cancelId) return

    try {
      setCancelling(true)

      const response = await fetch(`/api/enrollment/${cancelId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the cancelled enrollment from the state
        setEnrollments(enrollments.filter((enroll) => enroll._id !== cancelId))
      } else {
        alert("Failed to cancel enrollment")
      }
    } catch (error) {
      console.error("Error cancelling enrollment:", error)
      alert("An error occurred while cancelling the enrollment")
    } finally {
      setCancelling(false)
      setCancelId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading enrollments...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Conferences</h1>
        <p className="text-muted-foreground">Conferences you're registered to attend</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold">No registered conferences</h3>
          <p className="mb-4 text-muted-foreground">Browse and register for conferences to see them here</p>
          <Button asChild>
            <Link href="/conferences">Browse Conferences</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card key={enrollment._id} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted">
                <img
                  src={enrollment.conferenceID.image || `/placeholder.svg?height=200&width=400`}
                  alt={enrollment.conferenceID.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2 text-xl">{enrollment.conferenceID.title}</CardTitle>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {enrollment.conferenceID.category.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 p-4 pt-0 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(enrollment.conferenceID.startDate)} - {formatDate(enrollment.conferenceID.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{enrollment.conferenceID.location}</span>
                </div>
                <p className="line-clamp-2 mt-2">{enrollment.conferenceID.description}</p>

                <div className="mt-4 flex justify-between">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/conferences/${enrollment.conferenceID._id}`}>View Details</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => setCancelId(enrollment._id)}
                  >
                    <X className="mr-1 h-3 w-3" /> Cancel Registration
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your registration for this conference? You can register again later if you
              change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Registration</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelEnrollment}
              className="bg-red-500 hover:bg-red-600"
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Registration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
