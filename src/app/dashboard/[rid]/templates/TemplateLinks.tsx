'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type TemplateLink = {
  label: string;
  href: string;
  editable?: boolean;
};

type TemplateLinksProps = {
  interviewTemplates: TemplateLink[];
  emailTemplates: TemplateLink[];
};

export function TemplateLinks({
  interviewTemplates,
  emailTemplates,
}: TemplateLinksProps) {
  const [editMode, setEditMode] = useState(false);

  const getHref = (template: TemplateLink) => {
    if (!template.editable) return template.href;

    return `${template.href}/${editMode ? 'edit' : 'preview'}`;
  };

  const renderLinks = (templates: TemplateLink[]) => (
    <div className="mt-4 space-y-2">
      {templates.map((template) => (
        <a
          key={template.label}
          href={getHref(template)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          {template.label}
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      ))}
    </div>
  );

  return (
    <>
      <div
        className={
          editMode
            ? 'mb-6 flex items-center justify-between rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950/20'
            : 'mb-6 flex items-center justify-between rounded-lg border p-4'
        }
      >
        <div>
          <Label htmlFor="template-edit-mode" className="font-semibold">
            Template editing mode
          </Label>

          <p
            className={
              editMode
                ? 'mt-1 text-sm text-red-600 dark:text-red-400'
                : 'mt-1 text-sm text-muted-foreground'
            }
          >
            {editMode
              ? 'Editing is enabled. Changes to opened templates may be applied immediately.'
              : 'Templates are opened in preview mode to prevent accidental changes.'}
          </p>
        </div>

        <Switch
          id="template-edit-mode"
          checked={editMode}
          onCheckedChange={setEditMode}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-5">
          <h2 className="text-lg font-semibold">
            Candidates and reports files and templates
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Templates and resources used during interviews.
          </p>

          {renderLinks(interviewTemplates)}
        </section>

        <section className="rounded-lg border p-5">
          <h2 className="text-lg font-semibold">Email templates</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Templates for recruitment-related email communications.
          </p>

          {renderLinks(emailTemplates)}
        </section>
      </div>
    </>
  );
}
