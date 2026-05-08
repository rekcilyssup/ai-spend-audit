'use client';

import type { AuditResult, AuditRecommendation } from '@/types';
import { getToolDisplayName } from '@/lib/pricing';

interface AuditResultsProps {
  result: AuditResult;
  onBookConsultation?: () => void;
  onCaptureLead?: () => void;
}

export default function AuditResults({ result, onBookConsultation, onCaptureLead }: AuditResultsProps) {
  const { recommendations, totalMonthlySavings, totalAnnualSavings, isAlreadyOptimal, needsConsultation } = result;

  if (isAlreadyOptimal) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Hero - Already Optimal */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            You&apos;re Spending Well
          </h2>
          <p className="text-green-700 dark:text-green-300 max-w-md mx-auto">
            We didn&apos;t find significant savings opportunities for your setup.
            Your current tool selection looks reasonable for your team size.
          </p>
        </div>

        {/* Tool Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Your Setup</h3>
          <div className="space-y-3">
            {recommendations.filter(r => r.currentSpend > 0).map((rec, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {getToolDisplayName(rec.tool)}
                  </span>
                  <span className="text-sm text-zinc-500 ml-2">
                    {rec.currentPlan.replace(/-/g, ' ')}
                  </span>
                </div>
                <span className="text-zinc-600 dark:text-zinc-400">
                  ${rec.currentSpend}/mo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Capture */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Want to be notified when new optimizations apply to your stack?
          </p>
          <button
            onClick={onCaptureLead}
            className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
          >
            Notify Me
          </button>
        </div>
      </div>
    );
  }

  // Has savings cases
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Hero - Savings Found */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
        <div className="text-5xl font-bold mb-2">
          ${totalMonthlySavings.toLocaleString()}
          <span className="text-xl font-normal opacity-80">/mo</span>
        </div>
        <div className="text-blue-100">
          ${totalAnnualSavings.toLocaleString()}/year in potential savings
        </div>
      </div>

      {/* Tool Recommendations */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Recommendations</h3>
        <div className="space-y-4">
          {recommendations.filter(r => r.monthlySavings > 0).map((rec, i) => (
            <RecommendationCard key={i} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* CTA - High Savings */}
      {needsConsultation && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Significant Savings Opportunity Detected
          </h3>
          <p className="text-amber-700 dark:text-amber-300 mb-4">
            You could save ${totalMonthlySavings.toLocaleString()}/month. Credex offers discounted AI credits
            that could unlock even more savings.
          </p>
          <button
            onClick={onBookConsultation}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
          >
            Book Free Consultation
          </button>
        </div>
      )}

      {/* CTA - Lead Capture */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Want to save this audit for later?
        </p>
        <button
          onClick={onCaptureLead}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Save My Audit
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: AuditRecommendation }) {
  const { recommendedPlan, monthlySavings, annualSavings, reason, switchToAlternative } = recommendation;

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {getToolDisplayName(recommendation.tool)}
          </span>
          {recommendedPlan && (
            <span className="text-sm text-blue-600 ml-2">
              → {recommendedPlan.replace(/-/g, ' ')}
            </span>
          )}
          {switchToAlternative && (
            <span className="text-sm text-blue-600 ml-2">
              → Consider {getToolDisplayName(switchToAlternative)}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold text-green-600">
            ${monthlySavings}/mo
          </div>
          <div className="text-xs text-zinc-500">
            ${annualSavings}/year
          </div>
        </div>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{reason}</p>
    </div>
  );
}