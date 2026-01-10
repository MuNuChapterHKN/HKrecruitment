import { findOne } from '@/lib/services/recruitmentSessions';
import { notFound } from 'next/navigation';

export default async function Dashboard({
  params,
}: PageProps<'/dashboard/[rid]'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-2xl font-semibold text-muted-foreground">
        Work in progress
      </h1>
    </div>
  );
}
