'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';

const DEGREE_LEVELS = ['bsc', 'msc', 'phd'] as const;
const LANGUAGE_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native'] as const;

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    gpa: '',
    degreeLevel: '',
    course: '',
    courseArea: '',
    italianLevel: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [spFile, setSpFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmittingRef = useRef(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const isPdfFile = (file: File | null) => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    return file.type === 'application/pdf' && name.endsWith('.pdf');
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = 'Name is required.';
    if (!formData.surname.trim()) nextErrors.surname = 'Surname is required.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email format is invalid.';
    }
    if (!formData.gpa) {
      nextErrors.gpa = 'GPA is required.';
    } else {
      const gpaNum = parseFloat(formData.gpa);
      if (isNaN(gpaNum) || gpaNum < 18 || gpaNum > 30) {
        nextErrors.gpa = 'GPA must be between 18 and 30.';
      }
    }
    if (!formData.degreeLevel) {
      nextErrors.degreeLevel = 'Degree level is required.';
    }
    if (!formData.course.trim()) nextErrors.course = 'Course is required.';
    if (!formData.courseArea.trim()) {
      nextErrors.courseArea = 'Course area is required.';
    }
    if (!formData.italianLevel) {
      nextErrors.italianLevel = 'Italian level is required.';
    }

    if (!cvFile) {
      nextErrors.cvFile = 'CV PDF is required.';
    } else if (!isPdfFile(cvFile)) {
      nextErrors.cvFile = 'CV must be a PDF file.';
    }

    if (!spFile) {
      nextErrors.spFile = 'Study path PDF is required.';
    } else if (!isPdfFile(spFile)) {
      nextErrors.spFile = 'Study path must be a PDF file.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blocco immediato per prevenire click multipli
    if (isSubmittingRef.current || submitted || loading) return;

    // Imposta loading IMMEDIATAMENTE prima di qualsiasi altra operazione
    isSubmittingRef.current = true;
    setLoading(true);

    // Disabilita il bottone nell'DOM per bloccare ulteriori click
    if (submitButtonRef.current) {
      submitButtonRef.current.disabled = true;
      submitButtonRef.current.style.pointerEvents = 'none';
    }

    // Valida il form - se fallisce, resetta e ritorna
    if (!validateForm()) {
      setLoading(false);
      isSubmittingRef.current = false;
      // Riabilita il bottone
      if (submitButtonRef.current) {
        submitButtonRef.current.disabled = false;
        submitButtonRef.current.style.pointerEvents = '';
      }
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('surname', formData.surname);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('gpa', formData.gpa);
      formDataToSend.append('degreeLevel', formData.degreeLevel);
      formDataToSend.append('course', formData.course);
      formDataToSend.append('courseArea', formData.courseArea);
      formDataToSend.append('italianLevel', formData.italianLevel);

      if (cvFile) formDataToSend.append('cvFile', cvFile);
      if (spFile) formDataToSend.append('spFile', spFile);

      const submitPromise = (async () => {
        const res = await fetch('/api/applicants', {
          method: 'POST',
          body: formDataToSend,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          let message = `Submission failed (${res.status})`;
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
        setSubmitted(true);
        return data;
      })();

      await toast.promise(submitPromise, {
        loading: 'Submitting...',
        success: 'Application submitted.',
        error: (err) => err.message || 'Submission failed. Try again.',
      });
    } catch (error) {
      console.error(error);
      setSubmitted(false);
      toast.error('Network error. Try again.');
      // Riabilita il bottone in caso di errore
      if (submitButtonRef.current) {
        submitButtonRef.current.disabled = false;
        submitButtonRef.current.style.pointerEvents = '';
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
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
            Application Form
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
          <form
            onSubmit={handleSubmit}
            className="space-y-5 px-6 py-6 max-w-lg mx-auto"
          >
            {/* Personal Information Fields */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Name *
              </label>
              <input
                type="text"
                required
                disabled={loading || submitted}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Surname *
              </label>
              <input
                type="text"
                required
                disabled={loading || submitted}
                value={formData.surname}
                onChange={(e) =>
                  setFormData({ ...formData, surname: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.surname && (
                <p className="mt-1 text-xs text-rose-600">{errors.surname}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                required
                disabled={loading || submitted}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Academic Information Fields */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                GPA (18-30) *
              </label>
              <input
                type="number"
                required
                disabled={loading || submitted}
                min="18"
                max="30"
                step="0.01"
                value={formData.gpa}
                onChange={(e) =>
                  setFormData({ ...formData, gpa: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.gpa && (
                <p className="mt-1 text-xs text-rose-600">{errors.gpa}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Degree Level *
              </label>
              <select
                required
                disabled={loading || submitted}
                value={formData.degreeLevel}
                onChange={(e) =>
                  setFormData({ ...formData, degreeLevel: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">Select...</option>
                {DEGREE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </select>
              {errors.degreeLevel && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.degreeLevel}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course *
              </label>
              <input
                type="text"
                required
                disabled={loading || submitted}
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.course && (
                <p className="mt-1 text-xs text-rose-600">{errors.course}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course Area *
              </label>
              <input
                type="text"
                required
                disabled={loading || submitted}
                value={formData.courseArea}
                onChange={(e) =>
                  setFormData({ ...formData, courseArea: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.courseArea && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.courseArea}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Italian Level *
              </label>
              <select
                required
                disabled={loading || submitted}
                value={formData.italianLevel}
                onChange={(e) =>
                  setFormData({ ...formData, italianLevel: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">Select...</option>
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </select>
              {errors.italianLevel && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.italianLevel}
                </p>
              )}
            </div>

            {/* File Upload Fields */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                CV File (PDF) *
              </label>
              <input
                type="file"
                required
                disabled={loading || submitted}
                accept=".pdf"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
              {errors.cvFile && (
                <p className="mt-1 text-xs text-rose-600">{errors.cvFile}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Study Path File (PDF) *
              </label>
              <input
                type="file"
                required
                disabled={loading || submitted}
                accept=".pdf"
                onChange={(e) => setSpFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
              {errors.spFile && (
                <p className="mt-1 text-xs text-rose-600">{errors.spFile}</p>
              )}
            </div>

            {/* Submit Button Area */}
            <div className="pt-2 space-y-3">
              {submitted ? (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-lg bg-emerald-600 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg cursor-not-allowed"
                  >
                    ✓ Submitted
                  </button>
                  <p className="text-center text-sm text-emerald-700 font-medium">
                    Application submitted successfully.
                  </p>
                </>
              ) : (
                <button
                  ref={submitButtonRef}
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-slate-900 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
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
