'use client';

import type { MouseEvent } from 'react';
import { Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ArchiveButton({
  archived,
  onToggle,
}: {
  archived: boolean;
  onToggle: () => void;
}) {
  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={handleClick}
      title={archived ? 'Unarchive' : 'Archive'}
    >
      {archived ? (
        <ArchiveRestore className="h-4 w-4" />
      ) : (
        <Archive className="h-4 w-4" />
      )}
    </Button>
  );
}
