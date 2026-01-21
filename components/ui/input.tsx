import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-purple-500/30 selection:text-white border-white/5 h-9 w-full min-w-0 rounded-md border bg-white/5 backdrop-blur-sm px-3 py-1 text-base transition-standard outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-white/10",
        "aria-invalid:border-red-500/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }