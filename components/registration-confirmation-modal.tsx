"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react"

interface RegistrationConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  conference: {
    _id: string
    title: string
    startDate: string
    location: string
    maxAttendees: number
    attendees: number
  }
  onConfirm: () => void
  loading?: boolean
}

export default function RegistrationConfirmationModal({
  isOpen,
  onClose,
  conference,
  onConfirm,
  loading = false,
}: RegistrationConfirmationModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Confirm Your Registration</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to register for this free conference?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conference Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <h3 className="font-medium text-lg">{conference.title}</h3>
              <Badge variant="secondary" className="mt-1">
                Free Event
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(conference.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{conference.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{conference.maxAttendees - conference.attendees} spots remaining</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            You'll receive a confirmation email after registration.
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? "Registering..." : "Yes, Register Me"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
