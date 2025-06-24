"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Menu, Search, User, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "./ui/input"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const { session, isUser, isGuest, logout } = useAuth()
  const router = useRouter()

  const getUserTypeLabel = () => {
    if (isUser) return "Organizer"
    if (isGuest) return "Attendee"
    return ""
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 pt-4">
                <Link href="/" className="text-lg font-bold">
                  Conference Hub
                </Link>
                <Link href="/conferences" className="text-sm font-medium">
                  Browse Conferences
                </Link>
                <Link href="/conferences/calendar" className="text-sm font-medium">
                  Calendar
                </Link>
                <Link href="/speakers" className="text-sm font-medium">
                  Speakers
                </Link>
                <Link href="/topics" className="text-sm font-medium">
                  Topics
                </Link>
                {session ? (
                  <>
                    {isUser && (
                      <>
                        <Link href="/dashboard" className="text-sm font-medium">
                          My Dashboard
                        </Link>
                        <Link href="/conferences/create" className="text-sm font-medium">
                          Create Conference
                        </Link>
                      </>
                    )}
                    {isGuest && (
                      <Link href="/my-conferences" className="text-sm font-medium">
                        My Conferences
                      </Link>
                    )}
                    <Button variant="outline" onClick={() => logout()}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="hidden text-xl font-bold sm:inline-block">Conference Hub</span>
          </Link>
          <nav className="hidden md:flex md:gap-6">
            <Link href="/conferences" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Browse Conferences
            </Link>
            <Link
              href="/conferences/calendar"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
            >
              Calendar
            </Link>
            <Link href="/speakers" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Speakers
            </Link>
            <Link href="/topics" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Topics
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const searchValue = e.currentTarget.search.value
                if (searchValue.trim()) {
                  router.push(`/conferences?search=${encodeURIComponent(searchValue.trim())}`)
                }
              }}
              className="relative"
            >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                type="search"
                placeholder="Search..."
                className="w-full rounded-full bg-background pl-8 md:w-[200px] lg:w-[280px]"
              />
            </form>
          </div>

          {/* Only show Create Conference button for organizers (users) */}
          {isUser && (
            <Button asChild variant="default" size="sm" className="hidden md:flex">
              <Link href="/conferences/create">
                <Plus className="mr-1 h-4 w-4" /> Create Conference
              </Link>
            </Button>
          )}

          {/* Show login/register buttons only when not authenticated */}
          {!session ? (
            <div className="hidden gap-2 md:flex">
              <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          ) : (
            /* Show user menu when authenticated */
            <div className="flex items-center gap-2">
              <div className="hidden text-sm md:flex md:flex-col md:items-end">
                <span className="font-medium">{session.user.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {getUserTypeLabel()}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {getUserTypeLabel()}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isUser && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {isGuest && (
                    <DropdownMenuItem asChild>
                      <Link href="/my-conferences">My Conferences</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
