"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ListTodo, Shield, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { signOut } from "@/actions/auth"
import { useState } from "react"
import { Button } from "./ui/button"

interface NavProps {
  user: Profile
}

export function Nav({ user }: NavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pipeline", label: "Pipeline", icon: ListTodo },
  ]

  if (user.role === "admin" || user.role === "super_admin") {
    links.push({ href: "/admin", label: "Admin", icon: Shield })
  }

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-sharp",
              isActive
                ? "bg-surface-2 text-foreground"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background lg:hidden shrink-0">
        <span className="font-serif text-lg font-bold tracking-tight">Foreclosure Funder</span>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform lg:static lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center px-6">
          <span className="font-serif text-xl font-bold tracking-tight">Foreclosure Funder</span>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-4">
          <NavLinks />

          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-4">
            <div className="px-3">
              <p className="truncate text-sm font-medium">{user.full_name || "Investor"}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <form action={signOut}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 text-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
