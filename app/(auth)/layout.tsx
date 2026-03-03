import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-sharp border border-border bg-surface-1 p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
