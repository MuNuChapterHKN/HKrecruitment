'use client';

import { useState } from 'react';

const DEGREE_LEVELS = ['bsc', 'msc', 'phd'] as const;
const LANGUAGE_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native'] as const;

export default function TestApplyPage() {
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
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

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

      const res = await fetch('/api/applicants', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        data: { error: String(error) },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Test Application Form
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPA (0-30) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="30"
                  step="0.01"
                  value={formData.gpa}
                  onChange={(e) =>
                    setFormData({ ...formData, gpa: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree Level *
                </label>
                <select
                  required
                  value={formData.degreeLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, degreeLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Area *
                </label>
                <input
                  type="text"
                  required
                  value={formData.courseArea}
                  onChange={(e) =>
                    setFormData({ ...formData, courseArea: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Italian Level *
                </label>
                <select
                  required
                  value={formData.italianLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, italianLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CV File (PDF) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study Path File (PDF) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) => setSpFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              API Response
            </h2>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {response.status} {response.statusText}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-gray-900">
                    Response JSON:
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Submit the form to see the API response
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
