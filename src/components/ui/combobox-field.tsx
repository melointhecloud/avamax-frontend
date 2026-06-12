import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxFieldProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  searchPlaceholder?: string
  emptyMessage?: string
  isLoading?: boolean
  disabled?: boolean
  allowCustomValue?: boolean
}

export function ComboboxField({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  isLoading = false,
  disabled = false,
  allowCustomValue = true,
}: ComboboxFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!search) return options.slice(0, 100) // Limit initial display
    const normalizedSearch = search.toLowerCase().trim()
    return options.filter(opt =>
      opt.toLowerCase().includes(normalizedSearch)
    ).slice(0, 100)
  }, [options, search])

  const showCustomOption = allowCustomValue &&
    search.length >= 2 &&
    !filteredOptions.some(opt => opt.toLowerCase() === search.toLowerCase().trim())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal h-10"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {!isLoading && filteredOptions.length === 0 && !showCustomOption && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                Carregando...
              </div>
            )}
            {showCustomOption && (
              <CommandGroup heading="Valor personalizado">
                <CommandItem
                  value={`custom-${search}`}
                  onSelect={() => {
                    onChange(search.trim())
                    setSearch("")
                    setOpen(false)
                  }}
                >
                  Usar: &quot;{search.trim()}&quot;
                </CommandItem>
              </CommandGroup>
            )}
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option)
                      setSearch("")
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
