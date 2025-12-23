import { findOne } from '@/lib/services/recruitmentSessions';
import { notFound } from 'next/navigation';

export default async function Dashboard({
  params,
}: PageProps<'/dashboard/[rid]'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  return <h1>Dashboard {recruitmentSession.id}</h1>;
}
