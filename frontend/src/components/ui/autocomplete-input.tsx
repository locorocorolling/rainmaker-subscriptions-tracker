"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface AutocompleteOption {
  value: string
  label: string
  color?: string
  description?: string
  metadata?: any // For additional data like category
}

interface AutocompleteInputProps {
  options: AutocompleteOption[]
  value?: string
  onValueChange: (value: string) => void
  onSelectOption?: (option: AutocompleteOption) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxSuggestions?: number
}

export function AutocompleteInput({
  options,
  value = "",
  onValueChange,
  onSelectOption,
  placeholder = "Type to search...",
  disabled = false,
  className,
  maxSuggestions = 8,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [filteredOptions, setFilteredOptions] = React.useState<AutocompleteOption[]>([])
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const justSelectedRef = React.useRef(false)

  // Filter options based on input value
  React.useEffect(() => {
    if (!value.trim()) {
      setFilteredOptions([])
      setIsOpen(false)
      return
    }

    // Don't show suggestions if we just selected something
    if (justSelectedRef.current) {
      setFilteredOptions([])
      setIsOpen(false)
      return
    }

    const filtered = options.filter(option => {
      const searchTerm = value.toLowerCase()
      return (
        option.label.toLowerCase().includes(searchTerm) ||
        option.description?.toLowerCase().includes(searchTerm) ||
        option.value.toLowerCase().includes(searchTerm)
      )
    }).slice(0, maxSuggestions)

    setFilteredOptions(filtered)
    setIsOpen(filtered.length > 0)
    setHighlightedIndex(-1)
  }, [value, options, maxSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    justSelectedRef.current = false // Reset flag when user starts typing
    onValueChange(newValue)
  }

  const handleOptionSelect = (option: AutocompleteOption) => {
    justSelectedRef.current = true // Set flag to prevent immediate reopening
    onValueChange(option.label)
    onSelectOption?.(option)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (filteredOptions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Only close if not clicking on a suggestion
    if (!listRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />

      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors",
                index === highlightedIndex
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              )}
              onMouseDown={(e) => {
                e.preventDefault() // Prevent input blur
                handleOptionSelect(option)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.color && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: option.color }}
                />
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-sm truncate">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}