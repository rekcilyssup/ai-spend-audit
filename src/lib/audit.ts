/**
 * Audit Engine - Core logic for evaluating AI tool spend
 *
 * The engine evaluates:
 * 1. Are they on the right plan for their usage?
 * 2. Is there a cheaper plan from the same vendor that fits?
 * 3. Is there a substantially cheaper alternative?
 * 4. Are they paying retail when they could get credits?
 */
import type {
  AuditInput,
  AuditResult,
  AuditRecommendation,
  ToolInput,
  ToolName,
  ToolPlan,
  UseCase,
} from '../types';
import { toolPricing, getPricing, getToolDisplayName } from './pricing';

// Map use cases to recommended tools
const useCaseRecommendations: Record<UseCase, { primary: ToolName; alternatives: ToolName[] }> = {
  coding: { primary: 'cursor', alternatives: ['claude', 'github-copilot', 'windsurf'] },
  writing: { primary: 'chatgpt', alternatives: ['claude', 'gemini'] },
  data: { primary: 'claude', alternatives: ['openai-api', 'chatgpt'] },
  research: { primary: 'claude', alternatives: ['chatgpt', 'gemini'] },
  mixed: { primary: 'claude', alternatives: ['chatgpt', 'cursor'] },
};

function getCheaperPlan(name: ToolName, currentPlan: ToolPlan, seats: number): { plan: ToolPlan | null; reason: string } {
  const currentPricing = getPricing(name, currentPlan);
  if (!currentPricing) return { plan: null, reason: '' };

  const allPlansForTool = toolPricing.filter(p => p.name === name);

  // For Claude Team, check if Enterprise is cheaper per seat for large teams
  if (currentPlan === 'claude-team' && seats >= 10) {
    const entPricing = allPlansForTool.find(p => p.plan === 'claude-enterprise');
    if (entPricing && entPricing.monthlyCostPerSeat < currentPricing.monthlyCostPerSeat) {
      return {
        plan: 'claude-enterprise',
        reason: `Enterprise gives you better per-seat pricing at ${seats} seats`
      };
    }
  }

  // Find the cheapest plan that fits their seat count
  const cheaperPlans = allPlansForTool.filter(p =>
    p.monthlyCostPerSeat < currentPricing.monthlyCostPerSeat &&
    (p.maxSeats === null || p.maxSeats >= seats) &&
    p.minSeats <= seats
  );

  if (cheaperPlans.length > 0) {
    const best = cheaperPlans.sort((a, b) => a.monthlyCostPerSeat - b.monthlyCostPerSeat)[0];
    return {
      plan: best.plan,
      reason: `${best.displayName} at $${best.monthlyCostPerSeat}/seat is cheaper than ${currentPricing.displayName}`
    };
  }

  return { plan: null, reason: '' };
}

function getAlternativeSuggestion(
  currentTool: ToolName,
  useCase: UseCase
): { tool: ToolName; reason: string } | null {
  const recs = useCaseRecommendations[useCase];

  // If already on recommended tool, no alternative needed
  if (currentTool === recs.primary) {
    // But maybe there's a better alternative if they're on a premium plan
    return null;
  }

  // Check if current tool is more expensive than primary recommendation
  const currentPricing = toolPricing.find(p => p.name === currentTool);
  const primaryPricing = toolPricing.find(p => p.name === recs.primary);

  if (!currentPricing || !primaryPricing) return null;

  if (currentPricing.monthlyCostPerSeat > primaryPricing.monthlyCostPerSeat) {
    return {
      tool: recs.primary,
      reason: `${getToolDisplayName(recs.primary)} offers better value for ${useCase} use cases`
    };
  }

  return null;
}

function analyzeTool(
  toolInput: ToolInput,
  teamSize: number,
  useCase: UseCase
): AuditRecommendation {
  const { name, plan, monthlySpend, seats, enabled } = toolInput;

  if (!enabled) {
    return {
      tool: name,
      currentPlan: plan,
      recommendedPlan: null,
      currentSpend: 0,
      monthlySavings: 0,
      annualSavings: 0,
      reason: 'Tool is disabled',
    };
  }

  const pricing = getPricing(name, plan);
  if (!pricing) {
    return {
      tool: name,
      currentPlan: plan,
      recommendedPlan: null,
      currentSpend: monthlySpend,
      monthlySavings: 0,
      annualSavings: 0,
      reason: 'Pricing not found for this plan',
    };
  }

  // Check 1: Are they on the right plan for their team size?
  if (plan === 'claude-team' && seats < 5) {
    return {
      tool: name,
      currentPlan: plan,
      recommendedPlan: 'claude-pro',
      currentSpend: monthlySpend,
      monthlySavings: monthlySpend - (seats * 20),
      annualSavings: (monthlySpend - (seats * 20)) * 12,
      reason: `Claude Team requires 5 minimum seats. For ${seats} developer${seats === 1 ? '' : 's'}, Pro at $20/seat is better value.`
    };
  }

  // Check 1: Copilot Individual for single user
  if (plan === 'copilot-business' && seats === 1) {
    const individualCost = 10;
    const businessCost = 19;
    return {
      tool: name,
      currentPlan: plan,
      recommendedPlan: 'copilot-individual',
      currentSpend: monthlySpend,
      monthlySavings: (businessCost - individualCost),
      annualSavings: (businessCost - individualCost) * 12,
      reason: `Copilot Individual at $10/month is sufficient for 1 seat. Business at $19/seat is for teams needing security features.`
    };
  }

  // Check 2: Is there a cheaper plan from the same vendor?
  const cheaper = getCheaperPlan(name, plan, seats);
  if (cheaper.plan) {
    const currentPricing = getPricing(name, plan);
    const cheaperPricing = getPricing(name, cheaper.plan);
    if (currentPricing && cheaperPricing) {
      const currentTotal = currentPricing.monthlyCostPerSeat * seats;
      const cheaperTotal = cheaperPricing.monthlyCostPerSeat * seats;
      return {
        tool: name,
        currentPlan: plan,
        recommendedPlan: cheaper.plan,
        currentSpend: monthlySpend,
        monthlySavings: Math.max(0, currentTotal - cheaperTotal),
        annualSavings: Math.max(0, currentTotal - cheaperTotal) * 12,
        reason: cheaper.reason || `Switch to ${cheaperPricing.displayName} saves $${currentTotal - cheaperTotal}/month`
      };
    }
  }

  // Check 3: Is there a cheaper alternative tool?
  const alternative = getAlternativeSuggestion(name, useCase);
  if (alternative) {
    const altPricing = toolPricing.find(p => p.name === alternative.tool && p.plan === `${alternative.tool}-pro` as ToolPlan);
    if (altPricing && altPricing.monthlyCostPerSeat < pricing.monthlyCostPerSeat) {
      return {
        tool: name,
        currentPlan: plan,
        recommendedPlan: null,
        currentSpend: monthlySpend,
        monthlySavings: (pricing.monthlyCostPerSeat - altPricing.monthlyCostPerSeat) * seats,
        annualSavings: (pricing.monthlyCostPerSeat - altPricing.monthlyCostPerSeat) * seats * 12,
        reason: alternative.reason,
        switchToAlternative: alternative.tool
      };
    }
  }

  // Already on optimal plan
  return {
    tool: name,
    currentPlan: plan,
    recommendedPlan: null,
    currentSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'You\'re on the optimal plan for your use case.',
  };
}

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;

  const enabledTools = tools.filter(t => t.enabled);
  const recommendations = enabledTools.map(tool =>
    analyzeTool(tool, teamSize, useCase)
  );

  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const hasSavings = totalMonthlySavings > 0;

  // Need consultation if potential savings > $500/month
  const needsConsultation = totalMonthlySavings > 500;

  // Already optimal if no meaningful savings found for small spends
  const isAlreadyOptimal = !hasSavings || (totalMonthlySavings < 100 && !needsConsultation);

  return {
    input,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    isAlreadyOptimal,
    needsConsultation,
  };
}

export type { AuditResult, AuditRecommendation };