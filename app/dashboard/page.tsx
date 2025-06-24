"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChevronUp, Edit, Plus, Trash, Users } from "lucide-react"
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

interface Conference {
  _id: string
  title: string
  description: string
  category: {
    _id: string
    name: string
  }
  hashTags: string[]
  attendees: number
  startDate: string
  endDate: string
  location: string
  image: string
}

export default function DashboardPage() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { session, isUser } = useAuth()
  const router = useRouter()

  // Redirect if not logged in or not a conference organizer
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!session || !isUser) {
      setShouldRedirect(true)
    }
  }, [session, isUser])

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/login")
    }
  }, [shouldRedirect, router])

  if (shouldRedirect) {
    return null
  }

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const response = await fetch("/api/user/conferences")
        const data = await response.json()

        if (data.success) {
          setConferences(data.data)
        }
      } catch (error) {
        console.error("Error fetching conferences:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConferences()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)

      const response = await fetch(`/api/conferences/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the deleted conference from the state
        setConferences(conferences.filter((conf) => conf._id !== deleteId))
      } else {
        alert("Failed to delete conference")
      }
    } catch (error) {
      console.error("Error deleting conference:", error)
      alert("An error occurred while deleting the conference")
    } finally {
      setDeleting(false)
      setDeleteId(null)
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
    return <div className="container mx-auto px-4 py-8">Loading dashboard...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Manage your conferences</p>
        </div>
        <Button asChild>
          <Link href="/conferences/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Conference
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Conferences</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conferences.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-green-500">
                <ChevronUp className="h-4 w-4" /> Active conferences
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conferences.reduce((total, conf) => total + conf.attendees, 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-green-500">
                <ChevronUp className="h-4 w-4" /> Across all conferences
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>My Conferences</CardTitle>
            <CardDescription>Manage conferences you've created</CardDescription>
          </CardHeader>
          <CardContent>
            {conferences.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mb-2 text-xl font-semibold">No conferences yet</h3>
                <p className="mb-4 text-muted-foreground">Create your first conference to get started</p>
                <Button asChild>
                  <Link href="/conferences/create">
                    <Plus className="mr-2 h-4 w-4" /> Create Conference
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b bg-muted/50 p-3 font-medium">
                  <div className="col-span-2">Title</div>
                  <div>Date</div>
                  <div>Attendees</div>
                  <div>Actions</div>
                </div>
                <div className="divide-y">
                  {conferences.map((conference) => (
                    <div key={conference._id} className="grid grid-cols-5 items-center p-3">
                      <div className="col-span-2">
                        <div className="font-medium">{conference.title}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          <Badge variant="outline">{conference.category.name}</Badge>
                          {conference.hashTags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">{formatDate(conference.startDate)}</div>
                      <div>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {conference.attendees}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/conferences/${conference._id}`}>View</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/conferences/edit/${conference._id}`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeleteId(conference._id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the conference and remove all attendee
              registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
