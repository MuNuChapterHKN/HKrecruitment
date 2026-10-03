import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { requirePageAccess } from '@/lib/helpers/pageAuthorization';
import { TemplateLinks } from './TemplateLinks';

const googleDocsBaseUrl = 'https://docs.google.com/document/d/';
const googleFoldersBaseUrl = 'https://drive.google.com/drive/folders/';

const interviewTemplates = [
  {
    label: 'Candidates folder',
    href: `${googleFoldersBaseUrl}${process.env.CANDIDATES_DIR_ID}`,
  },
  {
    label: 'Report Folder',
    href: `${googleFoldersBaseUrl}${process.env.INTERVIEW_REPORTS_FOLDER_ID}`,
  },
  {
    label: 'Interview Report Template',
    href: `${googleDocsBaseUrl}${process.env.INTERVIEW_REPORT_TEMPLATE_ID}`,
    editable: true,
  },
];

const emailTemplates = [
  {
    label: 'Template Stage A',
    href: `${googleDocsBaseUrl}${process.env.STAGE_A_TEMPLATE_ID}`,
    editable: true,
  },
  {
    label: 'Template Stage B',
    href: `${googleDocsBaseUrl}${process.env.STAGE_B_TEMPLATE_ID}`,
    editable: true,
  },
];

export default async function TemplatesPage({
  params,
}: PageProps<'/dashboard/[rid]/templates'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const { rid } = await params;

  await requirePageAccess(session.user.id, rid, 'TemplatesPage');

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick access to the templates used during the recruitment process.
        </p>
      </header>

      <div className="mb-6 rounded-lg border bg-muted/40 p-4">
        <h2 className="text-sm font-semibold">Important notes</h2>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Access to these files is managed through Google Drive and is not
            controlled by this application, so not every user may have access to
            view or edit every file.
          </li>
          <li>
            Do not modify templates unless necessary. Changes are applied
            immediately and without additional confirmation.
          </li>
          <li>
            Template changes only affect future uses of the document and are not
            applied retroactively.
          </li>
        </ul>
      </div>

      <TemplateLinks
        interviewTemplates={interviewTemplates}
        emailTemplates={emailTemplates}
      />
    </main>
  );
}
