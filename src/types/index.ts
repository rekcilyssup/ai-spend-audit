// AI tool types and pricing data

export type ToolName =
  | 'cursor'
  | 'github-copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic-api'
  | 'openai-api'
  | 'gemini'
  | 'windsurf';

export type ToolPlan =
  // Cursor
  | 'cursor-hobby'
  | 'cursor-pro'
  | 'cursor-business'
  | 'cursor-enterprise'
  // GitHub Copilot
  | 'copilot-individual'
  | 'copilot-business'
  | 'copilot-enterprise'
  // Claude
  | 'claude-free'
  | 'claude-pro'
  | 'claude-max'
  | 'claude-team'
  | 'claude-enterprise'
  // ChatGPT
  | 'chatgpt-plus'
  | 'chatgpt-team'
  | 'chatgpt-enterprise'
  | 'chatgpt-api'
  // APIs
  | 'anthropic-api'
  | 'openai-api'
  // Gemini
  | 'gemini-pro'
  | 'gemini-ultra'
  | 'gemini-api'
  // Windsurf
  | 'windsurf-pro'
  | 'windsurf-enterprise';

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export interface ToolInput {
  name: ToolName;
  plan: ToolPlan;
  monthlySpend: number;
  seats: number;
  enabled: boolean;
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
  companyName?: string;
  email?: string;
}

export interface ToolPricing {
  name: ToolName;
  plan: ToolPlan;
  displayName: string;
  monthlyCostPerSeat: number;
  minSeats: number;
  maxSeats: number | null;
}

export interface AuditRecommendation {
  tool: ToolName;
  currentPlan: ToolPlan;
  recommendedPlan: ToolPlan | null;
  currentSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  switchToAlternative?: ToolName;
}

export interface AuditResult {
  input: AuditInput;
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isAlreadyOptimal: boolean;
  needsConsultation: boolean;
}

export interface LeadCapture {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  createdAt: string;
}