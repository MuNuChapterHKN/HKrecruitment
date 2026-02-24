const DEGREE_LEVELS = ['bsc', 'msc', 'phd'] as const;
const LANGUAGE_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native'] as const;

export default function ApplyPage() {
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
            action="/recruitment/api/applicants"
            method="POST"
            encType="multipart/form-data"
            className="space-y-5 p-6 mx-auto"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Surname *
              </label>
              <input
                type="text"
                name="surname"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                GPA (18-30) *
              </label>
              <input
                type="number"
                name="gpa"
                required
                min="18"
                max="30"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Degree Level *
              </label>
              <select
                name="degreeLevel"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select...</option>
                {DEGREE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course *
              </label>
              <input
                type="text"
                name="course"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course Area *
              </label>
              <input
                type="text"
                name="courseArea"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Italian Level *
              </label>
              <select
                name="italianLevel"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select...</option>
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                CV File (PDF) *
              </label>
              <input
                type="file"
                name="cvFile"
                required
                accept=".pdf"
                className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Study Path File (PDF) *
              </label>
              <input
                type="file"
                name="spFile"
                required
                accept=".pdf"
                className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.98]"
              >
                Submit Application
              </button>
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
