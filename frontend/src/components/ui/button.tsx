import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:translate-y-[1px]",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 dark:bg-destructive/60 active:translate-y-[1px]",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 active:translate-y-[1px]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:translate-y-[1px]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: 
          "text-primary underline-offset-4 hover:underline",
        glass:
          "backdrop-blur-md bg-white/10 text-white border border-white/20 shadow-lg hover:bg-white/20 active:translate-y-[1px]",
        minimal: 
          "bg-[#1c1c1c] text-white border border-[#333] hover:bg-[#252525] shadow-none active:translate-y-[1px]",
        flat: 
          "bg-[#222] text-white hover:bg-[#2a2a2a] shadow-none active:translate-y-[1px]",
        accent: 
          "bg-[#76ABAE] text-white hover:bg-[#76ABAE]/90 shadow-none active:translate-y-[1px]",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-md px-8 text-lg has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
        "xs": "h-7 rounded-md gap-1 px-2 text-xs has-[>svg]:px-1.5",
      },
      rounded: {
        default: "rounded-md",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  rounded,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, rounded, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
