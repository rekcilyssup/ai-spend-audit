import { describe, it, expect, vi } from 'vitest';
import { generateAuditSummary, generateFallbackSummary } from './ai-summary';
import type { AuditResult } from '@/types';

const mockAuditResult: AuditResult = {
  input: {
    tools: [
      { name: 'claude', plan: 'claude-team', monthlySpend: 125, seats: 3, enabled: true },
      { name: 'github-copilot', plan: 'copilot-business', monthlySpend: 57, seats: 3, enabled: true },
    ],
    teamSize: 3,
    useCase: 'coding',
  },
  recommendations: [
    {
      tool: 'claude',
      currentPlan: 'claude-team',
      recommendedPlan: 'claude-pro',
      currentSpend: 125,
      monthlySavings: 65,
      annualSavings: 780,
      reason: 'Claude Team requires 5 minimum seats.',
    },
    {
      tool: 'github-copilot',
      currentPlan: 'copilot-business',
      recommendedPlan: 'copilot-individual',
      currentSpend: 57,
      monthlySavings: 9,
      annualSavings: 108,
      reason: 'Copilot Individual is sufficient for 1 seat.',
    },
  ],
  totalMonthlySavings: 74,
  totalAnnualSavings: 888,
  isAlreadyOptimal: false,
  needsConsultation: false,
};

const mockOptimalResult: AuditResult = {
  ...mockAuditResult,
  recommendations: [
    {
      tool: 'claude',
      currentPlan: 'claude-pro',
      recommendedPlan: null,
      currentSpend: 20,
      monthlySavings: 0,
      annualSavings: 0,
      reason: "You're on the optimal plan for your use case.",
    },
  ],
  totalMonthlySavings: 0,
  totalAnnualSavings: 0,
  isAlreadyOptimal: true,
  needsConsultation: false,
};

describe('AI Summary Service', () => {
  describe('generateFallbackSummary', () => {
    it('generates summary for optimal setup', () => {
      const result = generateFallbackSummary(mockOptimalResult);
      expect(result.summary).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.summary).toContain('well-optimized');
    });

    it('generates summary with savings', () => {
      const result = generateFallbackSummary(mockAuditResult);
      expect(result.summary).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.summary).toContain('$74');
    });

    it('includes annual savings in fallback', () => {
      const result = generateFallbackSummary(mockAuditResult);
      expect(result.summary).toContain('$888');
    });
  });

  describe('generateAuditSummary', () => {
    it('returns fallback when ANTHROPIC_API_KEY is not set', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      const result = await generateAuditSummary(mockAuditResult);
      expect(result.summary).toBeDefined();
    });

    it('returns fallback when API call fails', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await generateAuditSummary(mockAuditResult);
      expect(result.summary).toBeDefined();
      expect(result.error).toBeUndefined();

      delete process.env.ANTHROPIC_API_KEY;
    });
  });
});
