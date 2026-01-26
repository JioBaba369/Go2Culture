"use client"

import * as React from "react"
import { format, isBefore, startOfDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { Matcher } from 'react-day-picker';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
  value?: Date
  onChange: (date: Date | undefined) => void
  availableDays?: string[];
  blockedDates?: string[];
}

export function BookingDatePicker({
  value,
  onChange,
  availableDays = [],
  blockedDates = [],
}: Props) {
  
  const disabledMatcher = (day: Date): boolean => {
    // Disable past dates
    if (isBefore(day, startOfDay(new Date()))) {
      return true;
    }

    // Disable dates not in the host's availability
    if (availableDays.length > 0) {
        if (!availableDays.includes(format(day, 'EEEE'))) return true;
    }
    
    // Disable dates specifically blocked by the host
    if (blockedDates.includes(format(day, 'yyyy-MM-dd'))) {
      return true;
    }

    return false;
  }

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
          disabled={disabledMatcher}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
