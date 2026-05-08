import { describe, it, expect } from 'vitest';
import { runAudit } from './audit';
import type { AuditInput, ToolInput } from '../types';

function createToolInput(
  name: ToolInput['name'],
  plan: ToolInput['plan'],
  monthlySpend: number,
  seats: number = 1
): ToolInput {
  return { name, plan, monthlySpend, seats, enabled: true };
}

function createAuditInput(tools: ToolInput[], teamSize: number = 5, useCase: AuditInput['useCase'] = 'coding'): AuditInput {
  return { tools, teamSize, useCase };
}

describe('Audit Engine', () => {
  describe('Team size optimization', () => {
    it('recommends Pro over Team for small Claude Teams', () => {
      // Claude Team min 5 seats at $25/seat = $125
      // Claude Pro at $20/seat = $20/seat
      const input = createAuditInput([
        createToolInput('claude', 'claude-team', 125, 3),
      ], 3, 'coding');

      const result = runAudit(input);
      const claudeRec = result.recommendations[0];

      // Team at $25/seat for 3 = $75/mo, Pro at $20/seat = $60/mo
      // Savings = $15/mo but not recommended because Team requires 5 min
      expect(claudeRec.recommendedPlan).toBe('claude-pro');
      expect(claudeRec.monthlySavings).toBe(65); // 125 - 60 = 65
    });

    it('recommends Individual for single Copilot Business seat', () => {
      const input = createAuditInput([
        createToolInput('github-copilot', 'copilot-business', 19, 1),
      ], 1, 'coding');

      const result = runAudit(input);
      const copilotRec = result.recommendations[0];

      expect(copilotRec.recommendedPlan).toBe('copilot-individual');
      expect(copilotRec.monthlySavings).toBe(9); // 19 - 10 = 9
    });
  });

  describe('Savings totals', () => {
    it('calculates annual savings from monthly', () => {
      const input = createAuditInput([
        createToolInput('github-copilot', 'copilot-business', 57, 3),
      ], 3, 'coding');

      const result = runAudit(input);

      expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
    });

    it('sums multiple tool savings', () => {
      const input = createAuditInput([
        createToolInput('claude', 'claude-team', 125, 3),
        createToolInput('github-copilot', 'copilot-business', 57, 3),
      ], 3, 'coding');

      const result = runAudit(input);

      expect(result.totalMonthlySavings).toBeGreaterThan(0);
    });
  });

  describe('Consultation trigger', () => {
    it('flags high savings for consultation', () => {
      const input = createAuditInput([
        createToolInput('claude', 'claude-max', 100, 10),
        createToolInput('cursor', 'cursor-enterprise', 600, 10),
      ], 10, 'coding');

      const result = runAudit(input);

      expect(result.needsConsultation).toBe(true);
    });
  });
});