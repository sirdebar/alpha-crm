import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rounded?: "sm" | "md" | "lg" | "full";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, rounded = "md", ...props }, ref) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 border bg-transparent px-3 py-2 text-sm shadow-sm transition-all outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          rounded === "sm" && "rounded-sm",
          rounded === "md" && "rounded-md",
          rounded === "lg" && "rounded-lg",
          rounded === "full" && "rounded-full",
        className
      )}
        ref={ref}
      {...props}
    />
  )
}
)

Input.displayName = "Input"

export { Input }
