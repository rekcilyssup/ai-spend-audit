'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AuditInput, AuditResult, UseCase, ToolInput } from '@/types';
import { runAudit } from '@/lib/audit';
import SpendForm from '@/components/SpendForm';
import AuditResults from '@/components/AuditResults';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import { generateShareId } from '@/lib/utils';

type AppState = 'form' | 'results' | 'lead-capture';

export default function Home() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get('share');

  // Lazy initialization for shared audits
  const getInitialState = (): { state: AppState; auditResult: AuditResult | null } => {
    if (!shareId) return { state: 'form', auditResult: null };
    if (typeof window === 'undefined') return { state: 'form', auditResult: null };
    const saved = localStorage.getItem(`credex-audit-${shareId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.result) return { state: 'results', auditResult: parsed.result };
      } catch { /* ignore */ }
    }
    return { state: 'form', auditResult: null };
  };

  const initial = getInitialState();
  const [state, setState] = useState<AppState>(initial.state);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(initial.auditResult);
  const [auditId] = useState(() => generateShareId());

  const handleRunAudit = (data: { tools: ToolInput[]; teamSize: number; useCase: UseCase }) => {
    const input: AuditInput = {
      ...data,
      tools: data.tools.filter(t => t.enabled),
    };

    const result = runAudit(input);
    setAuditResult(result);
    setState('results');

    localStorage.setItem(`credex-audit-${auditId}`, JSON.stringify({ input, result }));
  };

  const handleBookConsultation = () => {
    alert('Consultation booking coming soon! For now, email hello@credex.rocks');
  };

  const handleCaptureLead = () => {
    setState('lead-capture');
  };

  const handleLeadSubmit = async (data: { email: string; companyName?: string; role?: string; teamSize?: number }) => {
    console.log('Lead captured:', { ...data, auditId });
    const leads = JSON.parse(localStorage.getItem('credex-leads') || '[]');
    leads.push({ ...data, auditId, createdAt: new Date().toISOString() });
    localStorage.setItem('credex-leads', JSON.stringify(leads));
  };

  const handleShare = () => {
    if (auditId && window) {
      const url = `${window.location.origin}?share=${auditId}`;
      navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            AI Spend Audit
          </h1>
          {auditResult && state !== 'form' && (
            <button
              onClick={() => setState('form')}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              New Audit
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {state === 'form' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Find Your AI Savings
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                See if you&apos;re overspending on AI tools. Get personalized recommendations
                and unlock potential savings.
              </p>
            </div>
            <SpendForm onSubmit={handleRunAudit} />
          </div>
        )}

        {state === 'results' && auditResult && (
          <div>
            <div className="text-center mb-8">
              <button
                onClick={handleShare}
                className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
              >
                Share Results →
              </button>
            </div>
            <AuditResults
              result={auditResult}
              onBookConsultation={handleBookConsultation}
              onCaptureLead={handleCaptureLead}
            />
          </div>
        )}

        {state === 'lead-capture' && (
          <div className="max-w-md mx-auto">
            <LeadCaptureForm
              onSubmit={handleLeadSubmit}
              successMessage="We'll be in touch within 24 hours!"
            />
            <button
              onClick={() => setState('results')}
              className="w-full mt-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              ← Back to Results
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-zinc-500">
          <p>Built for the Credex hiring assignment</p>
        </div>
      </footer>
    </div>
  );
}