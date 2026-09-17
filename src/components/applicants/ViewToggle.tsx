'use client';

import { useAtom } from 'jotai';
import { LayoutGrid, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/hooks/use-mounted';
import { applicantsViewAtom } from '@/state/applicantsViewAtoms';

export function ViewToggle() {
  const [view, setView] = useAtom(applicantsViewAtom);
  const mounted = useMounted();
  const activeView = mounted ? view : 'grid';

  return (
    <div className="flex items-center rounded-md border border-border p-0.5">
      <Button
        variant={activeView === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        aria-label="Grid view"
        aria-pressed={activeView === 'grid'}
        title="Grid view"
        onClick={() => setView('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={activeView === 'table' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        aria-label="Table view"
        aria-pressed={activeView === 'table'}
        title="Table view"
        onClick={() => setView('table')}
      >
        <Table2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
