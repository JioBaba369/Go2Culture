
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import { format, startOfDay } from "date-fns"
import { zonedTimeToUtc } from "date-fns-tz"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
  value?: DateRange | undefined
  onChange?: (range: DateRange | undefined) => void
  disabledDates?: Date[]
  timezone?: string
}

export function Calendar({
  value,
  onChange,
  disabledDates = [],
  timezone = "Australia/Sydney",
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const disabled = [
    { before: new Date() }, // disable past
    ...disabledDates,
  ]

  function normalize(date?: Date) {
    if (!date) return undefined
    return zonedTimeToUtc(startOfDay(date), timezone)
  }

  return (
    <DayPicker
      selected={value}
      onSelect={(range) =>
        onChange?.({
          from: normalize(range?.from),
          to: normalize(range?.to),
        })
      }
      disabled={disabled}
      numberOfMonths={1}
      showOutsideDays
      fixedWeeks
      className="p-3 w-full max-w-sm mx-auto"
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",

        caption: "relative flex justify-between items-center",
        caption_label: "text-base font-semibold",
        
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 p-0"
        ),
        
        table: "w-full border-collapse mt-4",
        head_row: "flex",
        head_cell:
          "flex-1 text-center text-xs font-medium text-muted-foreground",

        row: "flex w-full mt-2",
        cell: "flex-1 h-12 text-center",

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-full p-0 font-normal rounded-full"
        ),
        day_range_start: "rounded-l-full",
        day_range_end: "rounded-r-full",
        day_range_middle: "bg-primary/20 !rounded-none",
        day_today: "bg-accent/20",
        day_disabled: "opacity-30 cursor-not-allowed",
        day_outside: "opacity-30",
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-5 w-5" />,
        IconRight: () => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
