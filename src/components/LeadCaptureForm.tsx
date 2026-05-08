'use client';

import { useState, type FormEvent } from 'react';

interface LeadCaptureFormProps {
  auditId: string;
  onSubmit: (data: { email: string; companyName?: string; role?: string; teamSize?: number }) => void;
  successMessage?: string;
}

export default function LeadCaptureForm({ auditId, onSubmit, successMessage }: LeadCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Honeypot field (hidden from real users)
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Honeypot check
    if (honeypot) {
      // Bot detected - silently succeed
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to backend (will implement later)
      await onSubmit({ email, companyName: companyName || undefined, role: role || undefined, teamSize: teamSize ? Number(teamSize) : undefined });
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Saved!
        </h3>
        <p className="text-green-700 dark:text-green-300">
          {successMessage || "We'll be in touch soon with your audit results."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Save Your Audit</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Enter your email to save this audit and get personalized recommendations.
      </p>

      {/* Honeypot - hidden from users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Work Email *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Company (optional)
          </label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Role (optional)
          </label>
          <input
            type="text"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="CTO, VP Eng..."
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="teamSize" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Team Size (optional)
        </label>
        <input
          type="number"
          id="teamSize"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="5"
          min={1}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 text-white font-semibold rounded-lg transition-colors"
      >
        {isSubmitting ? 'Saving...' : 'Save Audit'}
      </button>
    </form>
  );
}