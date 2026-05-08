// Pricing data for AI tools - sources must be cited in PRICING_DATA.md
import type { ToolPricing, ToolName, ToolPlan } from '../types';

export const toolPricing: ToolPricing[] = [
  // Cursor - https://cursor.sh/pricing - verified 2026-05-08
  { name: 'cursor', plan: 'cursor-hobby', displayName: 'Cursor Hobby', monthlyCostPerSeat: 0, minSeats: 1, maxSeats: 1 },
  { name: 'cursor', plan: 'cursor-pro', displayName: 'Cursor Pro', monthlyCostPerSeat: 20, minSeats: 1, maxSeats: null },
  { name: 'cursor', plan: 'cursor-business', displayName: 'Cursor Business', monthlyCostPerSeat: 40, minSeats: 2, maxSeats: null },
  { name: 'cursor', plan: 'cursor-enterprise', displayName: 'Cursor Enterprise', monthlyCostPerSeat: 60, minSeats: 1, maxSeats: null },

  // GitHub Copilot - https://github.com/features/copilot - verified 2026-05-08
  { name: 'github-copilot', plan: 'copilot-individual', displayName: 'Copilot Individual', monthlyCostPerSeat: 10, minSeats: 1, maxSeats: 1 },
  { name: 'github-copilot', plan: 'copilot-business', displayName: 'Copilot Business', monthlyCostPerSeat: 19, minSeats: 1, maxSeats: null },
  { name: 'github-copilot', plan: 'copilot-enterprise', displayName: 'Copilot Enterprise', monthlyCostPerSeat: 39, minSeats: 1, maxSeats: null },

  // Claude - https://www.anthropic.com/claude - verified 2026-05-08
  { name: 'claude', plan: 'claude-free', displayName: 'Claude Free', monthlyCostPerSeat: 0, minSeats: 1, maxSeats: 5 },
  { name: 'claude', plan: 'claude-pro', displayName: 'Claude Pro', monthlyCostPerSeat: 20, minSeats: 1, maxSeats: 1 },
  { name: 'claude', plan: 'claude-max', displayName: 'Claude Max', monthlyCostPerSeat: 100, minSeats: 1, maxSeats: 1 },
  { name: 'claude', plan: 'claude-team', displayName: 'Claude Team', monthlyCostPerSeat: 25, minSeats: 5, maxSeats: null },
  { name: 'claude', plan: 'claude-enterprise', displayName: 'Claude Enterprise', monthlyCostPerSeat: 50, minSeats: 1, maxSeats: null },

  // ChatGPT - https://chatgpt.com/pricing - verified 2026-05-08
  { name: 'chatgpt', plan: 'chatgpt-plus', displayName: 'ChatGPT Plus', monthlyCostPerSeat: 20, minSeats: 1, maxSeats: 1 },
  { name: 'chatgpt', plan: 'chatgpt-team', displayName: 'ChatGPT Team', monthlyCostPerSeat: 25, minSeats: 2, maxSeats: null },
  { name: 'chatgpt', plan: 'chatgpt-enterprise', displayName: 'ChatGPT Enterprise', monthlyCostPerSeat: 60, minSeats: 1, maxSeats: null },

  // Anthropic API - https://www.anthropic.com/claude - verified 2026-05-08
  { name: 'anthropic-api', plan: 'anthropic-api', displayName: 'Anthropic API', monthlyCostPerSeat: 0, minSeats: 1, maxSeats: null }, // $0.50-3/1M tokens

  // OpenAI API - https://openai.com/api/pricing - verified 2026-05-08
  { name: 'openai-api', plan: 'openai-api', displayName: 'OpenAI API', monthlyCostPerSeat: 0, minSeats: 1, maxSeats: null }, // $0.10-15/1M tokens

  // Gemini - https://ai.google.dev/pricing - verified 2026-05-08
  { name: 'gemini', plan: 'gemini-pro', displayName: 'Gemini Pro', monthlyCostPerSeat: 20, minSeats: 1, maxSeats: 1 },
  { name: 'gemini', plan: 'gemini-ultra', displayName: 'Gemini Ultra', monthlyCostPerSeat: 50, minSeats: 1, maxSeats: 1 },
  { name: 'gemini', plan: 'gemini-api', displayName: 'Gemini API', monthlyCostPerSeat: 0, minSeats: 1, maxSeats: null },

  // Windsurf - https://windsurf.com/pricing - verified 2026-05-08
  { name: 'windsurf', plan: 'windsurf-pro', displayName: 'Windsurf Pro', monthlyCostPerSeat: 20, minSeats: 1, maxSeats: null },
  { name: 'windsurf', plan: 'windsurf-enterprise', displayName: 'Windsurf Enterprise', monthlyCostPerSeat: 40, minSeats: 1, maxSeats: null },
];

export function getPricing(name: ToolName, plan: ToolPlan): ToolPricing | undefined {
  return toolPricing.find(p => p.name === name && p.plan === plan);
}

export function getToolDisplayName(name: ToolName): string {
  const names: Record<ToolName, string> = {
    'cursor': 'Cursor',
    'github-copilot': 'GitHub Copilot',
    'claude': 'Claude',
    'chatgpt': 'ChatGPT',
    'anthropic-api': 'Anthropic API',
    'openai-api': 'OpenAI API',
    'gemini': 'Gemini',
    'windsurf': 'Windsurf',
  };
  return names[name];
}