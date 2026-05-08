'use client';

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AuditInput, AuditResult, UseCase, ToolInput } from '@/types';
import { runAudit } from '@/lib/audit';
import SpendForm from '@/components/SpendForm';
import AuditResults from '@/components/AuditResults';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import { generateShareId } from '@/lib/utils';

type AppState = 'form' | 'results' | 'lead-capture' | 'share';

export default function Home() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get('share');

  const [state, setState] = useState<AppState>('form');
  const [auditInput, setAuditInput] = useState<AuditInput | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditId] = useState(() => generateShareId());

  // If shared URL, load from storage (simplified - real impl would fetch from DB)
  useEffect(() => {
    if (shareId) {
      const saved = localStorage.getItem(`credex-audit-${shareId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.result) {
            setAuditResult(parsed.result);
            setState('results');
          }
        } catch (e) {
          console.error('Failed to load shared audit:', e);
        }
      }
    }
  }, [shareId]);

  const handleRunAudit = (data: { tools: ToolInput[]; teamSize: number; useCase: UseCase }) => {
    const input: AuditInput = {
      ...data,
      tools: data.tools.filter(t => t.enabled),
    };

    const result = runAudit(input);
    setAuditInput(input);
    setAuditResult(result);
    setState('results');

    // Save to localStorage for share functionality
    localStorage.setItem(`credex-audit-${auditId}`, JSON.stringify({ input, result }));
  };

  const handleBookConsultation = () => {
    // TODO: Book consultation flow
    alert('Consultation booking coming soon! For now, email hello@credex.rocks');
  };

  const handleCaptureLead = () => {
    setState('lead-capture');
  };

  const handleLeadSubmit = async (data: { email: string; companyName?: string; role?: string; teamSize?: number }) => {
    // TODO: Submit to backend (Supabase)
    console.log('Lead captured:', { ...data, auditId });
    // For now, just save to localStorage
    const leads = JSON.parse(localStorage.getItem('credex-leads') || '[]');
    leads.push({ ...data, auditId, createdAt: new Date().toISOString() });
    localStorage.setItem('credex-leads', JSON.stringify(leads));
  };

  const handleSaveSuccess = () => {
    setState('form');
    // Clear form and start fresh
    localStorage.removeItem('credex-audit-form-data');
  };

  const handleShare = () => {
    // Generate share URL
    if (auditId && window) {
      const url = `${window.location.origin}?share=${auditId}`;
      navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {state === 'form' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Find Your AI Savings
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                See if you're overspending on AI tools. Get personalized recommendations
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
              auditId={auditId}
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

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-zinc-500">
          <p>Built for the Credex hiring assignment</p>
        </div>
      </footer>
    </div>
  );
}