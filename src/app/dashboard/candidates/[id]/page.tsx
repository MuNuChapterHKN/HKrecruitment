import Link from "next/link";
import { getApplicantById } from "@/lib/models/applicants";
import ActionButtons from "./ActionButtons";
import { getStageLabel } from "@/lib/stages";

export default async function CandidateDetailsPage({ params }: PageProps<'/dashboard/candidates/[id]'>) {
  const { id } = await params;
  const applicant = await getApplicantById(id);

  if (!applicant) {
    return (
      <main className="p-6">
        <h1>Candidato non trovato</h1>
        <Link href="/dashboard/candidates">Torna alla lista</Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl">
      {/* Header con nome e data */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {applicant.name} {applicant.surname}
        </h1>
        <p className="text-lg text-muted-foreground">
          Application date: {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : "N/A"}
        </p>
      </div>

      {/* Container principale con dettagli e azioni */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Dettagli candidato (2/3 della larghezza) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Dettagli candidato</h2>
          <div className="bg-card rounded-lg shadow p-6 space-y-4">
            <div>
              <strong>Nome completo:</strong> {applicant.name} {applicant.surname}
            </div>
            <div>
              <strong>Titolo di studio:</strong> {applicant.degreeLevel || "N/A"}
            </div>
            <div>
              <strong>Interview:</strong> {applicant.interviewId || "Not assigned"}
            </div>
            <div>
              <strong>Stage:</strong> {getStageLabel(applicant.stage)}
            </div>
          </div>
        </div>

        {/* Sezione azioni - Client Component */}
        <ActionButtons applicant={applicant} />
      </div>

      {/* Sezione documenti scaricabili */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Documenti</h2>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="#"
              className="flex items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="mr-3">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Curriculum Vitae</p>
                <p className="text-sm text-muted-foreground">Download CV (PDF)</p>
              </div>
            </Link>

            <Link
              href="#"
              className="flex items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="mr-3">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Study Path</p>
                <p className="text-sm text-muted-foreground">Download transcript (PDF)</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottone torna alla lista */}
      <Link href="/dashboard/applicant.">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90">
          ← Torna alla lista
        </button>
      </Link>
    </main>
  );
}
