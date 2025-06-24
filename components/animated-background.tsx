"use client"

import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#0f0f1a] via-[#0d0d17] to-[#0a0a12]">
        {/* Gentle floating circles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-5 blur-2xl"
            style={{
              width: `${80 + (i % 3) * 40}px`,
              height: `${80 + (i % 3) * 40}px`,
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
              transform: `translateY(${scrollY * (0.02 + (i % 4) * 0.005)}px)`,
              transition: "transform 0.2s ease-out",
            }}
          />
        ))}

        {/* Soft grid lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            transform: `translateY(${scrollY * 0.08}px)`,
          }}
        />
      </div>
    </>
  )
}
