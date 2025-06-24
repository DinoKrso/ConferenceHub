import { Button } from "@/components/ui/button"
import { Calendar, Filter, MapPin, Users } from "lucide-react"
import Link from "next/link"
import ConferenceList from "@/components/conference-list"
import FeaturedConference from "@/components/featured-conference"
import HeroSection from "@/components/hero-section"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />

      <section className="mb-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Conferences</h2>
          <Button asChild variant="ghost">
            <Link href="/conferences" className="flex items-center gap-2">
              View All <Filter className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <FeaturedConference />
      </section>

      <section className="mb-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Upcoming Conferences</h2>
          <Button asChild variant="ghost">
            <Link href="/conferences/calendar" className="flex items-center gap-2">
              Calendar View <Calendar className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ConferenceList limit={6} />
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow backdrop-blur-sm bg-background/70">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Global Reach</h3>
          <p className="text-muted-foreground">
            Access conferences from around the world, with detailed location information and travel guides.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow backdrop-blur-sm bg-background/70">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Networking</h3>
          <p className="text-muted-foreground">
            Connect with speakers, attendees, and industry professionals to expand your professional network.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow backdrop-blur-sm bg-background/70">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Personalized Schedule</h3>
          <p className="text-muted-foreground">
            Create your own conference schedule, set reminders, and receive notifications for your registered events.
          </p>
        </div>
      </section>
    </div>
  )
}
