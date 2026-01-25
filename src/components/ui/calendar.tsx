"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps & {
  className?: string
  classNames?: DayPickerProps["classNames"]
  showOutsideDays?: boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 sm:p-4 bg-background border border-border rounded-xl shadow-sm w-full max-w-[340px] mx-auto",
        className
      )}
      classNames={{
        // Layout
        months: "flex flex-col space-y-4",
        month: "space-y-4",

        // Header with month + arrows beside it
        caption: "flex justify-between items-center px-2 relative",
        caption_label: "text-base font-semibold tracking-tight grow text-center",

        // Navigation buttons (now beside month)
        nav: "flex items-center space-x-1 shrink-0",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 hover:bg-accent/80 transition-colors"
        ),
        nav_button_previous: "",
        nav_button_next: "",

        // Table & grid
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-muted-foreground font-medium text-sm flex-1 flex items-center justify-center p-2",

        // Rows & cells
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "flex-1",
          // Range background styling
          "[&:has([aria-selected])]:bg-accent/50",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-range-start)]:rounded-l-md"
        ),

        // Day button
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-full transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground"
        ),

        // Selected & range states
        day_range_start: "rounded-l-full bg-primary text-primary-foreground",
        day_range_end: "rounded-r-full bg-primary text-primary-foreground",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow",
        day_today:
          "bg-accent text-accent-foreground font-semibold ring-1 ring-accent-foreground/40",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:opacity-30 aria-selected:bg-accent/20",
        day_disabled: "text-muted-foreground opacity-40 cursor-not-allowed",
        day_hidden: "invisible",

        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-5 w-5" />,
        IconRight: () => <ChevronRight className="h-5 w-5" />,
      }}
      modifiersClassNames={{
        today: "day-today",
        selected: "day-selected",
        outside: "day-outside",
        disabled: "day-disabled",
        range_middle: "day-range-middle",
        range_start: "day-range-start",
        range_end: "day-range-end",
      }}
      // Optional: better mobile experience
      fixedWeeks={false} // ← avoids awkward empty rows on short months
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
