"use client"

import * as React from "react"
import { X, Search, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  onValueChange: (value: string[]) => void
  defaultValue?: string[]
  placeholder?: string
  maxCount?: number
  className?: string
}

export function MultiSelect({
  options,
  onValueChange,
  defaultValue = [],
  placeholder = "Select items",
  maxCount = 3,
  className,
}: MultiSelectProps) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue)
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    setSelectedValues(defaultValue)
  }, [defaultValue])

  const toggleOption = (optionValue: string) => {
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((value) => value !== optionValue)
      : [...selectedValues, optionValue]
    
    setSelectedValues(newSelectedValues)
    onValueChange(newSelectedValues)
    // NON chiudiamo il dropdown qui per permettere selezioni multiple
  }

  const removeOption = (optionValue: string) => {
    const newSelectedValues = selectedValues.filter((value) => value !== optionValue)
    setSelectedValues(newSelectedValues)
    onValueChange(newSelectedValues)
  }

  const handleClear = () => {
    setSelectedValues([])
    onValueChange([])
  }

  const toggleAll = () => {
    if (selectedValues.length === options.length) {
      handleClear()
    } else {
      const allValues = options.map(option => option.value)
      setSelectedValues(allValues)
      onValueChange(allValues)
    }
  }

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedOptions = selectedValues.map(value => 
    options.find(option => option.value === value)
  ).filter(Boolean) as Option[]

  return (
    <div className={cn("w-full relative", className)}>
      {/* Main input area */}
      <div
        className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            <>
              {selectedOptions.slice(0, maxCount).map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs"
                >
                  {option.label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeOption(option.value)
                    }}
                  />
                </Badge>
              ))}
              {selectedOptions.length > maxCount && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedOptions.length - maxCount} more
                </Badge>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {selectedValues.length > 0 && (
            <X
              className="h-4 w-4 cursor-pointer hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            />
          )}
          <div className={cn("transition-transform duration-200", isOpen && "rotate-180")}>
            ▼
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
            {/* Search input */}
            <div className="p-2 border-b flex items-center">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Search interviewers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto p-1">
              {/* Select All option */}
              <div
                className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleAll()
                }}
              >
                <div className={cn(
                  "mr-3 h-4 w-4 border-2 border-primary rounded flex items-center justify-center transition-colors",
                  selectedValues.length === options.length ? "bg-primary text-primary-foreground" : "bg-background"
                )}>
                  {selectedValues.length === options.length && (
                    <Check className="h-3 w-3" />
                  )}
                </div>
                <span className="font-medium">(Select All)</span>
              </div>

              {/* Individual options */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <div
                      key={option.value}
                      className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleOption(option.value)
                      }}
                    >
                      <div className={cn(
                        "mr-3 h-4 w-4 border-2 border-primary rounded flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-background"
                      )}>
                        {isSelected && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  )
                })
              ) : (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No interviewers found
                </div>
              )}
            </div>

            {/* Footer con pulsante per chiudere */}
            <div className="p-2 border-t bg-muted/50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Done ({selectedValues.length} selected)
              </button>
            </div>
          </div>
          
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  )
}