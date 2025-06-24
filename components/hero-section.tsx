"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="mb-12 overflow-hidden">
      <div className="relative rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 p-8 text-white">
        {/* Animated background elements */}
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-xl"
          style={{
            transform: `translate(${scrollY * 0.05}px, ${scrollY * -0.05}px)`,
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-rose-300/10 blur-xl"
          style={{
            transform: `translate(${scrollY * -0.03}px, ${scrollY * 0.03}px)`,
          }}
        />

        <div className="relative z-10 max-w-3xl">
          <h1
            className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              transform: `translateY(${scrollY * -0.1}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            Discover Professional Conferences Worldwide
          </h1>
          <p
            className="mb-6 text-lg opacity-90"
            style={{
              transform: `translateY(${scrollY * -0.05}px)`,
              transition: "transform 0.2s ease-out",
            }}
          >
            Browse upcoming conferences, register as an attendee, and connect with industry professionals all in one
            place.
          </p>
          <div
            className="flex flex-wrap gap-4"
            style={{
              transform: `translateY(${scrollY * -0.02}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
              <Link href="/conferences">Browse Conferences</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
