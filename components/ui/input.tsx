import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-blue/20 selection:text-foreground h-9 w-full min-w-0 rounded-md border border-border-subtle bg-background px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-blue/50 focus-visible:ring-1 focus-visible:ring-blue/20",
        "aria-invalid:border-red/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }