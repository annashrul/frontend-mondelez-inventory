import { formatNumber } from '@/lib/numberFormat';
import { useTranslation } from '@/lib/i18n'
import * as React from "react"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

export function AsyncCombobox({
  value,
  onValueChange,
  loadOptions,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ditemukan.",
  loadingText = "Memuat data...",
  debounceMs = 300,
  className,
  selectedOption: selectedOptionProp,
  disabled = false,
}) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [options, setOptions] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState(selectedOptionProp || null)
  const requestId = React.useRef(0)
  const cacheRef = React.useRef(new Map())
  const loadOptionsRef = React.useRef(loadOptions)

  React.useEffect(() => {
    loadOptionsRef.current = loadOptions
  }, [loadOptions])

  React.useEffect(() => {
    setSelectedOption((current) => {
      if (!value) return null

      const loadedOption = options.find((option) => option.value === value && option.label)
      if (loadedOption) return loadedOption

      if (selectedOptionProp?.value === value && selectedOptionProp.label) {
        return selectedOptionProp
      }

      if (current?.value === value && current.label) {
        return current
      }

      return selectedOptionProp?.value === value ? selectedOptionProp : null
    })
  }, [value, selectedOptionProp, options])

  React.useEffect(() => {
    if (!open) return undefined
    const cacheKey = search.trim().toLowerCase()

    if (cacheRef.current.has(cacheKey)) {
      requestId.current += 1
      setOptions(cacheRef.current.get(cacheKey))
      setLoading(false)
      return undefined
    }

    const timeout = window.setTimeout(async () => {
      const currentRequest = ++requestId.current
      setLoading(true)

      try {
        const result = await loadOptionsRef.current(search)
        if (currentRequest === requestId.current) {
          cacheRef.current.set(cacheKey, result)
          setOptions(result)
        }
      } catch {
        if (currentRequest === requestId.current) setOptions([])
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false)
        }
      }
    }, debounceMs)

    return () => window.clearTimeout(timeout)
  }, [open, search, debounceMs])

  const optionLabel = option => {
    if (!option.localizedLabel) return option.label
    const { key, params = {}, numberParams = [] } = option.localizedLabel
    const localizedParams = Object.fromEntries(Object.entries(params).map(([name, value]) => [
      name, numberParams.includes(name) ? formatNumber(value) : value,
    ]))
    return t(key, localizedParams)
  }
  const selectedLabel = selectedOption?.value === value && selectedOption.label
    ? optionLabel(selectedOption)
    : value

  // A modal popover owns its portalled scroll area, so a parent Dialog's
  // scroll lock permits wheel/touch scrolling inside the option list.
  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
        >
          <span className="truncate">{selectedLabel || t(placeholder)}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={t(searchPlaceholder)}
          />
          <CommandList className="overscroll-y-contain touch-pan-y">
            {loading ? (
              <div className="space-y-2 p-2" aria-label={t(loadingText)}>
                {["w-4/5", "w-3/5", "w-11/12"].map((width) => (
                  <Skeleton key={width} className={cn("h-8", width)} />
                ))}
              </div>
            ) : (
              <>
                <CommandEmpty>{t(emptyText)}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        setSelectedOption(option)
                        onValueChange(option.value, option)
                        setOpen(false)
                        setSearch("")
                      }}
                    >
                      <CheckIcon className={cn("mr-2 size-4", value === option.value ? "opacity-100" : "opacity-0")} />
                      <span className="truncate">{optionLabel(option)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
