"use client"

import * as React from "react"
import { format, isBefore, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabledDates?: Date[]
}

export function BookingDatePicker({
  value,
  onChange,
  disabledDates = [],
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : "Select a date"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) =>
            isBefore(date, startOfDay(new Date())) ||
            disabledDates.some(
              (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
            )
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
