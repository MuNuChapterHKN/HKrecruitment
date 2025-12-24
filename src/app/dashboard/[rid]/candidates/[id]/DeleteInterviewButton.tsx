'use client';

import { Button } from '@/components/ui';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

type DeleteInterviewButtonProps = {
  deleteAction: () => Promise<void>;
};

export function DeleteInterviewButton({
  deleteAction,
}: DeleteInterviewButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAction();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete interview. Please try again.'
      );
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 border border-destructive rounded px-3 py-2">
        <span className="text-sm text-destructive">{error}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setError(null)}
          className="text-destructive hover:text-destructive"
        >
          Dismiss
        </Button>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Are you sure?</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Yes'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setShowConfirm(true)}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
