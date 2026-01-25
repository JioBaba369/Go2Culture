"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

export function ResponsiveDatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (isDesktop) {
      setOpen(false) // Close popover on select
    }
  }

  const TriggerButton = (
    <Button
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal h-12 sm:h-10",
        !date && "text-muted-foreground"
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : <span>Pick a date</span>}
    </Button>
  )

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent className="p-4">
        <div className="mx-auto w-full max-w-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate} // On mobile, just set the date. User clicks "Done" to close.
            className="flex justify-center"
            initialFocus
          />
          <DrawerClose asChild>
            <Button className="w-full mt-4 h-12">Done</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
