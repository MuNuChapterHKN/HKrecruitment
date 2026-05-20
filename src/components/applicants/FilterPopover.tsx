'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type FilterPopoverProps<T extends string> = {
  label: string;
  options: FilterOption<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  width?: string;
};

export function FilterPopover<T extends string>({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  width = 'w-[220px]',
}: FilterPopoverProps<T>) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const count = selected.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'justify-between gap-2 h-9',
            count > 0 && 'border-primary/50'
          )}
        >
          <span className="flex items-center gap-1.5">
            {label}
            {count > 0 && (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-xs font-semibold"
              >
                {count}
              </Badge>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('p-0', width)} align="start">
        <Command>
          {searchable && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => toggle(opt.value)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
