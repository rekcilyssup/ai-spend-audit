import type { AuditResult } from '@/types';
import { getToolDisplayName } from '@/lib/pricing';

const SYSTEM_PROMPT = `You are a helpful AI audit assistant. Your role is to analyze the AI tool spending data and provide a concise, personalized summary for the user based on their audit results. Focus on actionable recommendations and clear explanations.`;

function buildUserPrompt(result: AuditResult): string {
  const { recommendations, totalMonthlySavings, totalAnnualSavings, isAlreadyOptimal, input } = result;
  const enabledTools = recommendations.filter(r => r.currentSpend > 0);

  let prompt = `Analyze this AI spend audit for a ${input.teamSize}-person team focused on ${input.useCase} work.\n\n`;
  prompt += `Current Setup:\n`;
  enabledTools.forEach(r => {
    prompt += `- ${getToolDisplayName(r.tool)} (${r.currentPlan.replace(/-/g, ' ')}): $${r.currentSpend}/month\n`;
  });

  if (isAlreadyOptimal) {
    prompt += `\nThis team is already optimized - no significant savings found.\n`;
  } else {
    prompt += `\nPotential Savings: $${totalMonthlySavings}/month ($${totalAnnualSavings}/year)\n\n`;
    prompt += `Recommendations:\n`;
    recommendations.filter(r => r.monthlySavings > 0).forEach(r => {
      prompt += `- ${getToolDisplayName(r.tool)}: ${r.reason} (save $${r.monthlySavings}/mo)\n`;
    });
  }

  prompt += `\nProvide a brief 2-3 sentence summary with actionable advice.`;
  return prompt;
}

export interface AISummaryResult {
  summary: string;
  error?: never;
}

export interface AISummaryError {
  summary?: never;
  error: string;
}

export type AISummaryResponse = AISummaryResult | AISummaryError;

export async function generateAuditSummary(result: AuditResult): Promise<AISummaryResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Generate a fallback summary without API
    return generateFallbackSummary(result);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(result),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return generateFallbackSummary(result);
    }

    const data = await response.json();
    return { summary: data.content[0].text };
  } catch (err) {
    console.error('Failed to generate AI summary:', err);
    return generateFallbackSummary(result);
  }
}

export function generateFallbackSummary(result: AuditResult): AISummaryResponse {
  const { totalMonthlySavings, isAlreadyOptimal, recommendations } = result;

  if (isAlreadyOptimal) {
    return {
      summary: "Your current AI tool setup appears well-optimized for your team. Keep monitoring usage and consider revisiting this audit quarterly as pricing and your needs evolve.",
    };
  }

  const actionableRecs = recommendations.filter(r => r.monthlySavings > 0).slice(0, 2);
  const topSaving = actionableRecs[0];

  if (topSaving) {
    return {
      summary: `You could save $${totalMonthlySavings}/month by ${topSaving.reason.toLowerCase()}. This would translate to $${(totalMonthlySavings * 12).toLocaleString()}/year in savings. Consider starting with the highest-impact change first.`,
    };
  }

  return {
    summary: `Your audit shows potential savings of $${totalMonthlySavings}/month. Review the recommendations above and prioritize changes that won't disrupt your team's workflow.`,
  };
}
