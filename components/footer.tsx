import Link from "next/link"
import { Calendar } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur-sm mt-auto">
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold">Conference Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop platform for discovering, registering, and managing professional conferences worldwide.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/conferences" className="text-muted-foreground hover:text-foreground">
                  Browse Conferences
                </Link>
              </li>
              <li>
                <Link href="/conferences/calendar" className="text-muted-foreground hover:text-foreground">
                  Calendar View
                </Link>
              </li>
              <li>
                <Link href="/speakers" className="text-muted-foreground hover:text-foreground">
                  Speakers
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-muted-foreground hover:text-foreground">
                  Topics
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">For Organizers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/organizers/dashboard" className="text-muted-foreground hover:text-foreground">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/organizers/create" className="text-muted-foreground hover:text-foreground">
                  Create Conference
                </Link>
              </li>
              <li>
                <Link href="/organizers/analytics" className="text-muted-foreground hover:text-foreground">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/organizers/resources" className="text-muted-foreground hover:text-foreground">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Conference Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
