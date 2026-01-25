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
      fixedWeeks // Prevents height changes between months
      captionLayout="dropdown-buttons"
      fromYear={1900}
      toYear={2030}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center h-9",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex gap-2",
        nav: "flex items-center",
        nav_button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 top-1 z-10"
        ),
        nav_button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 top-1 z-10"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between",
        head_cell:
          "text-muted-foreground rounded-md w-10 sm:w-9 font-normal text-[0.8rem] text-center uppercase",
        row: "flex w-full mt-2 justify-between",
        cell: "h-10 w-10 sm:h-9 sm:w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 sm:h-9 sm:w-9 p-0 font-normal transition-all active:scale-95 sm:active:scale-100",
          "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-bold",
        day_outside: "day-outside text-muted-foreground/30 opacity-50",
        day_disabled: "text-muted-foreground opacity-20 cursor-not-allowed",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft {...props} className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight {...props} className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
