import Link from "next/link";
import { listAllApplicants } from "@/lib/models/applicants";
import type { Applicant } from "@/db/types";

const degreeOptions = [
  "Tutti",
  "Laurea Magistrale",
  "Diploma",
];

const siteStatus = "ok"; // Puoi calcolarlo in base a query o stato reale

export default async function CandidatesPage() {
  const applicants: Applicant[] = await listAllApplicants();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Candidates</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-2 max-w-md items-center">
        <input
          type="text"
          placeholder="Search by name or surname..."
          className="border rounded px-3 py-2 flex-1"
          disabled
        />
        <select
          className="border rounded px-3 py-2 flex-1"
          disabled
        >
          {degreeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium
            ${siteStatus === "ok" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
          style={{ minWidth: 100 }}
        >
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: siteStatus === "ok" ? "#22c55e" : "#eab308",
            }}
          />
          {siteStatus === "ok" ? "Site OK" : "Problems"}
        </div>
      </div>
      <div className="grid gap-4">
        {applicants.map(applicant => (
          <div key={applicant.id} className="bg-card rounded-lg shadow p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">{applicant.name} {applicant.surname}</span>
                <div className="text-sm text-muted-foreground">
                  Application date: {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : ""}
                </div>
                <div className="text-sm">Degree: {applicant.degreeLevel}</div>
                <div className="text-sm">Interview: {applicant.interviewId ? applicant.interviewId : "Not assigned"}</div>
              </div>
              <Link href={`/dashboard/candidates/${applicant.id}`}>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">View Details</button>
              </Link>
            </div>
          </div>
        ))}
        {applicants.length === 0 && (
          <div className="text-center text-muted-foreground">No candidates found.</div>
        )}
      </div>
    </main>
  );
}
