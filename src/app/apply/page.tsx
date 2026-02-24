'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { coursesByDegree } from './courses';
import { degreeLevelMap } from '@/lib/degrees';
import type { DegreeLevel } from '@/lib/degrees';

const DEGREE_LEVELS = ['bsc', 'msc', 'phd'] as const;
const LANGUAGE_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native'] as const;

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel | ''>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || submitted) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const submitPromise = fetch('/recruitment/api/applicants', {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        let message = `Invio fallito (${res.status})`;
        if (data && typeof data.error === 'string') {
          message = data.error;
        } else if (Array.isArray(data?.error)) {
          message = data.error
            .map((issue: { message?: string }) => issue.message)
            .filter(Boolean)
            .join(' · ');
        }
        throw new Error(message);
      }
    });

    toast.promise(submitPromise, {
      loading: 'Invio della candidatura in corso…',
      success: 'Candidatura inviata con successo.',
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Errore di rete. Riprova più tardi.',
    });

    try {
      await submitPromise;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Errore di rete. Riprova più tardi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-200">
            Recruitment
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Modulo di Candidatura
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Compila i dati richiesti e carica i tuoi documenti per completare la
            candidatura.
          </p>
        </div>

        <div className="rounded-3xl bg-white shadow-2xl ring-1 ring-white/10">
          <div className="border-b border-slate-200/70 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Dati personali e accademici
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              I campi contrassegnati con * sono obbligatori.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-6 mx-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                required
                disabled={loading || submitted}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cognome *
              </label>
              <input
                type="text"
                name="surname"
                required
                disabled={loading || submitted}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading || submitted}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Media Voti (18-30) *
              </label>
              <input
                type="number"
                name="gpa"
                required
                min="18"
                max="30"
                step="0.01"
                disabled={loading || submitted}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tipo di Corso *
              </label>
              <select
                name="degreeLevel"
                required
                value={degreeLevel}
                onChange={(e) => {
                  setDegreeLevel(e.target.value as DegreeLevel | '');
                }}
                disabled={loading || submitted}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">Seleziona...</option>
                {DEGREE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {degreeLevelMap[level]}
                  </option>
                ))}
              </select>
            </div>

            {degreeLevel === 'phd' ? (
              <input type="hidden" name="course" value="PhD" />
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Corso di Studi *
                </label>
                <select
                  name="course"
                  required
                  disabled={loading || submitted || !degreeLevel}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">
                    {degreeLevel
                      ? 'Seleziona...'
                      : 'Seleziona prima il tipo di laurea'}
                  </option>
                  {degreeLevel &&
                    coursesByDegree[degreeLevel].map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Area del Corso *
              </label>
              <input
                type="text"
                name="courseArea"
                required
                placeholder="es. AI, Quantum Engineering, Nanotechnologies for ICTs…"
                disabled={loading || submitted}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Livello di Italiano *
              </label>
              <select
                name="italianLevel"
                required
                disabled={loading || submitted}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">Seleziona...</option>
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                CV (PDF) *
              </label>
              <input
                type="file"
                name="cvFile"
                required
                accept=".pdf"
                disabled={loading || submitted}
                className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Piano di Studi (PDF) *
              </label>
              <input
                type="file"
                name="spFile"
                required
                accept=".pdf"
                disabled={loading || submitted}
                className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
            </div>

            <div className="pt-2 space-y-3">
              {submitted ? (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-lg bg-emerald-600 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg cursor-not-allowed"
                  >
                    ✓ Inviata
                  </button>
                  <p className="text-center text-sm text-emerald-700 font-medium">
                    Candidatura inviata con successo.
                  </p>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-slate-900 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
                >
                  {loading ? 'Invio in corso…' : 'Invia Candidatura'}
                </button>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-red-700">Invio fallito</p>
                    <p className="mt-0.5 text-red-600">
                      {error} — riprova più tardi.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
          <div className="border-t border-slate-200/70 px-6 py-4 text-[11px] text-slate-500">
            I tuoi dati saranno trattati secondo la policy privacy vigente.
          </div>
        </div>
      </div>
    </div>
  );
}
