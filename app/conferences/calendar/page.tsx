"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Conference {
  _id: string
  title: string
  startDate: string
  endDate: string
  location: string
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/conferences")
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

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Group conferences by date
  const conferencesByDate: Record<string, Conference[]> = {}

  conferences.forEach((conference) => {
    const startDate = new Date(conference.startDate)
    const endDate = new Date(conference.endDate)

    // For each day between start and end date, add the conference
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0]
      if (!conferencesByDate[dateString]) {
        conferencesByDate[dateString] = []
      }
      conferencesByDate[dateString].push(conference)
      currentDate.setDate(currentDate.getDate() + 1)
    }
  })

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border p-1" />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const eventsForDay = conferencesByDate[dateString] || []

      days.push(
        <div key={day} className="min-h-24 border border-border p-1">
          <div className="mb-1 flex items-center justify-between">
            <span className={`text-sm font-medium ${eventsForDay.length > 0 ? "text-purple-600" : ""}`}>{day}</span>
            {eventsForDay.length > 0 && (
              <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-600">
                {eventsForDay.length}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {eventsForDay.map((event) => (
              <Link href={`/conferences/${event._id}`} key={event._id}>
                <div className="rounded bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100">
                  {event.title}
                </div>
              </Link>
            ))}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Conference Calendar</h1>
          <p className="text-muted-foreground">View upcoming conferences by date</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={currentMonth.toString()} onValueChange={(value) => setCurrentMonth(Number.parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currentYear.toString()} onValueChange={(value) => setCurrentYear(Number.parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {months[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-medium">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Upcoming Conferences</h2>
        {loading ? (
          <div className="flex h-40 items-center justify-center">Loading conferences...</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(conferencesByDate)
              .sort()
              .slice(0, 5)
              .map(([date, events]) => (
                <div key={date} className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-medium">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div key={event._id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/conferences/${event._id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
