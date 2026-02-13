'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { updateApplicantFile, type FileType } from '@/lib/api/applicants';

interface UpdateFileDialogProps {
  applicantId: string;
  fileType: FileType;
  fileLabel: string;
}

export function UpdateFileDialog({
  applicantId,
  fileType,
  fileLabel,
}: UpdateFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    const result = await updateApplicantFile(applicantId, file, fileType);

    if (result.isErr()) {
      toast.error(result.error.message);
      setIsUploading(false);
      return;
    }

    toast.success(`${fileLabel} updated successfully`);
    setOpen(false);
    setFile(null);
    setIsUploading(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="absolute -top-1 -right-1 size-6 rounded-full bg-background border shadow-sm hover:bg-muted"
        >
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Update {fileLabel}</DialogTitle>
        </DialogHeader>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-input file:text-sm file:font-medium file:bg-background hover:file:bg-muted file:text-foreground"
        />
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen(false);
              setFile(null);
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
