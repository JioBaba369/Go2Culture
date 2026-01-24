
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // FIXED: Forces 6 rows so the calendar height never changes
      fixedWeeks 
      className={cn("p-3 bg-white dark:bg-zinc-950 rounded-md border", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        // FIXED: Relative anchor for absolute arrows
        month_caption: "flex justify-center pt-1 relative items-center h-9", 
        caption_label: "text-sm font-medium",
        nav: "flex items-center",
        // FIXED: Absolute positioning with top-1 keeps them away from dates
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 top-1 z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 top-1 z-10"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between",
        weekday:
          "text-muted-foreground rounded-md w-10 sm:w-9 font-normal text-[0.8rem] text-center uppercase",
        week: "flex w-full mt-2 justify-between",
        day: "h-10 w-10 sm:h-9 sm:w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 sm:h-9 sm:w-9 p-0 font-normal transition-all active:scale-95 sm:active:scale-100",
          "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:opacity-100"
        ),
        selected: "bg-primary text-primary-foreground",
        today: "bg-accent text-accent-foreground font-bold",
        outside: "day-outside text-muted-foreground/30 opacity-50",
        disabled: "text-muted-foreground opacity-20 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          return orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
