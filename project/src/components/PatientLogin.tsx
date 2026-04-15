import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeAlert, Contact, FileText, MapPinned, Phone, UserRound } from 'lucide-react';
import { PatientDetails } from '../types';

interface PatientLoginProps {
  initialDetails: PatientDetails | null;
  onSave: (details: PatientDetails) => void;
  onBack: () => void;
}

const EMPTY_DETAILS: PatientDetails = {
  name: '',
  age: '',
  mobileNumber: '',
  address: '',
  emergencyContact: '',
};

function PatientLogin({ initialDetails, onSave, onBack }: PatientLoginProps) {
  const [form, setForm] = useState<PatientDetails>(EMPTY_DETAILS);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialDetails) {
      setForm(initialDetails);
    }
  }, [initialDetails]);

  const handleChange = (field: keyof PatientDetails, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const name = form.name.trim();
    const age = form.age.trim();
    const mobileNumber = form.mobileNumber.trim();
    const address = form.address.trim();
    const emergencyContact = form.emergencyContact.trim();

    if (!name || !age || !mobileNumber || !address || !emergencyContact) {
      setError('Please fill in all patient details before continuing.');
      return;
    }

    if (!/^[0-9]+$/.test(age) || Number(age) <= 0 || Number(age) > 120) {
      setError('Age must be a valid number between 1 and 120.');
      return;
    }

    if (!/^[0-9+\-()\s]{7,20}$/.test(mobileNumber)) {
      setError('Please enter a valid mobile number.');
      return;
    }

    if (!/^[0-9+\-()\s]{7,20}$/.test(emergencyContact)) {
      setError('Please enter a valid emergency contact number.');
      return;
    }

    setError('');
    onSave({
      name,
      age,
      mobileNumber,
      address,
      emergencyContact,
    });
  };

  return (
    <div className="min-h-screen app-page-bg">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-green-700">
            Patient Login
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="pro-surface rounded-3xl p-6 sm:p-8">
            <div className="mb-6">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                <FileText className="h-3.5 w-3.5" />
                Intake Form
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-800 sm:text-3xl">
                Enter patient details before analysis
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
                These details are attached to the analysis record and printed in the downloadable PDF report.
              </p>
            </div>

            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <label className="sm:col-span-1">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><UserRound className="h-4 w-4 text-green-600" /> Full Name</span>
                <input
                  value={form.name}
                  onChange={event => handleChange('name', event.target.value)}
                  type="text"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-green-400"
                  placeholder="Enter full name"
                />
              </label>

              <label className="sm:col-span-1">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><BadgeAlert className="h-4 w-4 text-green-600" /> Age</span>
                <input
                  value={form.age}
                  onChange={event => handleChange('age', event.target.value)}
                  type="number"
                  min="1"
                  max="120"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-green-400"
                  placeholder="Age"
                />
              </label>

              <label className="sm:col-span-1">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><Phone className="h-4 w-4 text-green-600" /> Mobile Number</span>
                <input
                  value={form.mobileNumber}
                  onChange={event => handleChange('mobileNumber', event.target.value)}
                  type="tel"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-green-400"
                  placeholder="Primary contact number"
                />
              </label>

              <label className="sm:col-span-1">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><Contact className="h-4 w-4 text-green-600" /> Emergency Contact</span>
                <input
                  value={form.emergencyContact}
                  onChange={event => handleChange('emergencyContact', event.target.value)}
                  type="tel"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-green-400"
                  placeholder="Emergency contact number"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><MapPinned className="h-4 w-4 text-green-600" /> Address</span>
                <textarea
                  value={form.address}
                  onChange={event => handleChange('address', event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-green-400"
                  placeholder="Home address"
                />
              </label>

              {error && (
                <div className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="sm:col-span-2 mt-2 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="btn-primary-brand inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white transition-all"
                >
                  Continue to Analysis
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-green-500 px-6 py-3 text-sm font-bold text-green-700 transition-colors hover:bg-green-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          <aside className="pro-surface rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-800">Why this page exists</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-500">
              <p>
                This project does not use authentication, so the page functions as a patient intake screen before uploading a blood smear image.
              </p>
              <p>
                After submission, the patient details are stored locally, carried into the analysis result, and included in the exported PDF report.
              </p>
              <p>
                If you return later, the form will reopen with the last saved details already filled in.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PatientLogin;