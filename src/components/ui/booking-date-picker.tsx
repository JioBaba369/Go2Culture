
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
  blockedDates?: (string | Date)[]; // Can be string 'yyyy-MM-dd' or Date object
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
    const formattedBlockedDates = blockedDates.map(d => typeof d === 'string' ? d : format(d, 'yyyy-MM-dd'));
    if (formattedBlockedDates.includes(format(day, 'yyyy-MM-dd'))) {
      return true;
    }

    return false;
  }

  // A date is highlighted if it's an explicitly available day of the week, and not blocked.
  const highlightedMatcher = (day: Date): boolean => {
    // Don't highlight if no specific weekdays are set for availability
    if (availableDays.length === 0) {
      return false;
    }
    // Don't highlight past dates
    if (isBefore(day, startOfDay(new Date()))) {
      return false;
    }

    // Don't highlight if the host has specifically blocked this date
    const formattedBlockedDates = blockedDates.map(d => typeof d === 'string' ? d : format(d, 'yyyy-MM-dd'));
    if (formattedBlockedDates.includes(format(day, 'yyyy-MM-dd'))) {
      return false;
    }

    // Highlight if it's one of the available days of the week
    return availableDays.includes(format(day, 'EEEE'));
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
          modifiers={{ available: highlightedMatcher }}
          modifiersClassNames={{ available: 'font-bold text-primary' }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
