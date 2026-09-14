import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled,
  className,
  id,
}) {
  const [open, setOpen] = React.useState(false)

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined
  const isValidDate = selected && isValid(selected)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-slot="date-picker-trigger"
          className={cn(
            "w-full justify-start text-left font-normal",
            !isValidDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {isValidDate ? format(selected, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? selected : undefined}
          captionLayout="dropdown"
          onSelect={(date) => {
            if (!date) return
            onChange?.(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
