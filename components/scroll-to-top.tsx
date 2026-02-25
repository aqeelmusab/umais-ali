"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card/80 backdrop-blur-md text-muted-foreground shadow-lg shadow-background/40 transition-all duration-300 hover:text-foreground hover:border-primary hover:shadow-[0_0_20px] hover:shadow-primary/20 cursor-pointer md:bottom-8 md:right-8 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}
