'use client';

import { useAtom } from 'jotai';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { applicantsFiltersAtom } from '@/state/applicantsFiltersAtoms';

export function SearchInput() {
  const [filters, setFilters] = useAtom(applicantsFiltersAtom);

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        placeholder="Cerca per nome o email…"
        aria-label="Cerca candidati"
        value={filters.search}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, search: e.target.value }))
        }
        className="pl-9 pr-9"
      />
      {filters.search && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancella ricerca"
          onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
