interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <span className="font-serif text-base font-medium tracking-tight text-foreground">
        Umais
      </span>
      <span className="text-primary/50 text-xs">&#x2022;</span>
      <span className="font-serif text-base font-medium tracking-tight gradient-text">
        Ali
      </span>
    </span>
  )
}
