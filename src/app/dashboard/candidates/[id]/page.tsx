import Link from "next/link";
import { getApplicantById } from "@/lib/models/applicants";
import type { ApplicationStage } from "@/db/types";
import ActionButtons from "./ActionButtons";
import { getStageLabel } from "./statusConfig";

export default async function CandidateDetailsPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const candidate = await getApplicantById(id);
  if (!candidate) {
    return (
      <main className="p-6">
        <h1>Candidato non trovato</h1>
        <Link href="/dashboard/candidates">Torna alla lista</Link>
      </main>
    );
  }

  // Usa il campo 'stage' dal database, con fallback ad "A" se non specificato
  const currentStage: ApplicationStage = (candidate.stage as ApplicationStage) || "A";

  return (
    <main className="p-6 max-w-6xl">
      {/* Header con nome e data */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {candidate.name} {candidate.surname}
        </h1>
        <p className="text-lg text-muted-foreground">
          Application date: {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "N/A"}
        </p>
      </div>

      {/* Container principale con dettagli e azioni */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Dettagli candidato (2/3 della larghezza) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Dettagli candidato</h2>
          <div className="bg-card rounded-lg shadow p-6 space-y-4">
            <div>
              <strong>Nome completo:</strong> {candidate.name} {candidate.surname}
            </div>
            <div>
              <strong>Titolo di studio:</strong> {candidate.degreeLevel || "N/A"}
            </div>
            <div>
              <strong>Interview:</strong> {candidate.interviewId || "Not assigned"}
            </div>
            <div>
              <strong>Stage:</strong> {getStageLabel(currentStage)}
            </div>
            <div>
              <strong>Stage Code:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded uppercase">{currentStage}</span>
            </div>
          </div>
        </div>

        {/* Sezione azioni - Client Component */}
        <ActionButtons stage={currentStage} candidateId={id} />
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
      <Link href="/dashboard/candidates">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90">
          ← Torna alla lista
        </button>
      </Link>
    </main>
  );
}