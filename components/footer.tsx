import Link from "next/link"
import { Logo } from "@/components/logo"

const footerLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
]

export function Footer() {
  return (
    <footer className="px-6 py-10 md:px-12 lg:px-20">
      <div className="divider-gradient" />
      <div className="flex flex-col gap-6 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xs text-muted-foreground">
            SEO Executive
          </span>
        </div>

        {/* Center */}
        <nav className="flex items-center gap-5 sm:gap-6" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Umais Ali. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
