import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
        secondary:
          "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200",
        process:
          "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200",
        sector:
          "border-transparent bg-purple-100 text-purple-700 hover:bg-purple-200",
        service:
          "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
        accent:
          "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
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
