"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <nav
          className={`flex items-center gap-1 rounded-full px-2 py-2 transition-all duration-500 ${
            isScrolled
              ? "glass shadow-lg shadow-background/40"
              : "bg-transparent border border-transparent"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors hover:bg-foreground/5"
          >
            <Logo />
          </Link>

          {/* Separator */}
          <div className="hidden h-4 w-px bg-foreground/10 md:block" />

          {/* Nav Links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-foreground/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden h-4 w-px bg-foreground/10 md:block" />

          {/* CTA */}
          <Link
            href="#contact"
            className="hidden md:inline-flex items-center justify-center rounded-full bg-primary px-5 py-1.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
          >
            Hire Me
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full md:hidden text-foreground transition-colors hover:bg-foreground/5"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[60] bg-background/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal={isMobileMenuOpen}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-1.5"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Logo />
          </Link>
          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-foreground/5"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-6 pt-16 gap-2" aria-label="Mobile navigation">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-4xl font-serif tracking-tight text-foreground py-3 border-b border-border transition-all duration-500 hover:text-primary ${
                isMobileMenuOpen ? "animate-fade-up" : "opacity-0"
              } stagger-${index + 1}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`mt-8 inline-flex items-center justify-center h-14 px-10 text-base font-medium text-primary-foreground bg-primary rounded-full transition-all duration-500 hover:brightness-110 ${
              isMobileMenuOpen ? "animate-fade-up" : "opacity-0"
            } stagger-4`}
          >
            Hire Me
          </Link>
        </nav>
      </div>
    </>
  )
}
