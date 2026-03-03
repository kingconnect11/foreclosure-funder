import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sharp border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-pine focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-surface-2 text-foreground hover:bg-surface-2/80",
        secondary:
          "border-transparent bg-accent-slate/20 text-blue-400 hover:bg-accent-slate/30",
        info:
          "border-transparent bg-accent-slate/20 text-blue-400",
        warning:
          "border-transparent bg-warning/20 text-orange-400",
        danger:
          "border-transparent bg-danger/20 text-red-400",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
