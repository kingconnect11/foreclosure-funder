"use client"

import { Bell } from "lucide-react"

export function Header() {
  return (
    <header className="hidden lg:flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-8">
      <div className="flex flex-1 items-center gap-4">
        {/* Can put a search bar here if desired */}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <div className="h-2 w-2 rounded-full bg-accent-pine"></div>
          <span>System Active</span>
        </div>
        <button className="relative rounded-sharp p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-accent-crimson"></span>
        </button>
      </div>
    </header>
  )
}
