'use client';

import { useState, useEffect } from 'react';
import type { UseCase, ToolInput, ToolName, ToolPlan } from '@/types';

interface SpendFormProps {
  onSubmit: (data: { tools: ToolInput[]; teamSize: number; useCase: UseCase }) => void;
  initialData?: Partial<{
    tools: ToolInput[];
    teamSize: number;
    useCase: UseCase;
  }>;
}

// All supported tools
const tools: { name: ToolName; label: string; plans: { value: ToolPlan; label: string }[] }[] = [
  {
    name: 'cursor',
    label: 'Cursor',
    plans: [
      { value: 'cursor-hobby', label: 'Hobby ($0)' },
      { value: 'cursor-pro', label: 'Pro ($20/user)' },
      { value: 'cursor-business', label: 'Business ($40/user)' },
      { value: 'cursor-enterprise', label: 'Enterprise ($60/user)' },
    ],
  },
  {
    name: 'github-copilot',
    label: 'GitHub Copilot',
    plans: [
      { value: 'copilot-individual', label: 'Individual ($10)' },
      { value: 'copilot-business', label: 'Business ($19/user)' },
      { value: 'copilot-enterprise', label: 'Enterprise ($39/user)' },
    ],
  },
  {
    name: 'claude',
    label: 'Claude',
    plans: [
      { value: 'claude-free', label: 'Free ($0)' },
      { value: 'claude-pro', label: 'Pro ($20)' },
      { value: 'claude-max', label: 'Max ($100)' },
      { value: 'claude-team', label: 'Team ($25/user)' },
      { value: 'claude-enterprise', label: 'Enterprise ($50/user)' },
    ],
  },
  {
    name: 'chatgpt',
    label: 'ChatGPT',
    plans: [
      { value: 'chatgpt-plus', label: 'Plus ($20)' },
      { value: 'chatgpt-team', label: 'Team ($25/user)' },
      { value: 'chatgpt-enterprise', label: 'Enterprise ($60/user)' },
    ],
  },
  {
    name: 'anthropic-api',
    label: 'Anthropic API',
    plans: [
      { value: 'anthropic-api', label: 'Pay-as-you-go' },
    ],
  },
  {
    name: 'openai-api',
    label: 'OpenAI API',
    plans: [
      { value: 'openai-api', label: 'Pay-as-you-go' },
    ],
  },
  {
    name: 'gemini',
    label: 'Gemini',
    plans: [
      { value: 'gemini-pro', label: 'Pro ($20)' },
      { value: 'gemini-ultra', label: 'Ultra ($50)' },
      { value: 'gemini-api', label: 'API (pay-as-you-go)' },
    ],
  },
  {
    name: 'windsurf',
    label: 'Windsurf',
    plans: [
      { value: 'windsurf-pro', label: 'Pro ($20)' },
      { value: 'windsurf-enterprise', label: 'Enterprise ($40/user)' },
    ],
  },
];

const useCases: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Coding / Software Development' },
  { value: 'writing', label: 'Writing / Content Creation' },
  { value: 'data', label: 'Data Analysis / ETL' },
  { value: 'research', label: 'Research / Knowledge Work' },
  { value: 'mixed', label: 'Mixed / All of the above' },
];

// Storage key for form persistence
const STORAGE_KEY = 'credex-audit-form-data';

function getDefaultTools(): ToolInput[] {
  return tools.map(t => ({
    name: t.name,
    plan: t.plans[0].value,
    monthlySpend: 0,
    seats: 1,
    enabled: false,
  }));
}

export default function SpendForm({ onSubmit, initialData }: SpendFormProps) {
  const [teamSize, setTeamSize] = useState(initialData?.teamSize ?? 5);
  const [useCase, setUseCase] = useState<UseCase>(initialData?.useCase ?? 'coding');
  const [toolInputs, setToolInputs] = useState<ToolInput[]>(() => {
    if (initialData?.tools) return initialData.tools;
    return getDefaultTools();
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.useCase) setUseCase(parsed.useCase);
        if (parsed.tools) setToolInputs(parsed.tools);
      } catch (e) {
        console.error('Failed to load saved form data:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const data = { teamSize, useCase, tools: toolInputs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [teamSize, useCase, toolInputs]);

  const updateTool = (index: number, updates: Partial<ToolInput>) => {
    const newTools = [...toolInputs];
    newTools[index] = { ...newTools[index], ...updates };
    setToolInputs(newTools);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const enabledTools = toolInputs.filter(t => t.enabled);
    if (enabledTools.length === 0) {
      alert('Please select at least one AI tool to audit.');
      setIsSubmitting(false);
      return;
    }

    onSubmit({ tools: toolInputs, teamSize, useCase });
    setIsSubmitting(false);
  };

  const enabledCount = toolInputs.filter(t => t.enabled).length;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8">
      {/* Team Settings */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Team Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="teamSize" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Team Size (developers)
            </label>
            <input
              type="number"
              id="teamSize"
              min={1}
              max={1000}
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="useCase" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Primary Use Case
            </label>
            <select
              id="useCase"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UseCase)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {useCases.map(uc => (
                <option key={uc.value} value={uc.value}>{uc.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* AI Tools */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">AI Tools</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {enabledCount} selected
          </span>
        </div>

        <div className="space-y-4">
          {tools.map((tool, index) => {
            const input = toolInputs[index];
            const isEnabled = input.enabled;

            return (
              <div
                key={tool.name}
                className={`border rounded-lg p-4 transition-colors ${
                  isEnabled
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`tool-${tool.name}`}
                    checked={isEnabled}
                    onChange={(e) => updateTool(index, { enabled: e.target.checked })}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                      <label htmlFor={`plan-${tool.name}`} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        {tool.label}
                      </label>
                      <select
                        id={`plan-${tool.name}`}
                        value={input.plan}
                        onChange={(e) => updateTool(index, { plan: e.target.value as ToolPlan })}
                        disabled={!isEnabled}
                        className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500"
                      >
                        {tool.plans.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`spend-${tool.name}`} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Monthly Spend ($)
                      </label>
                      <input
                        type="number"
                        id={`spend-${tool.name}`}
                        min={0}
                        value={input.monthlySpend}
                        onChange={(e) => updateTool(index, { monthlySpend: Math.max(0, parseInt(e.target.value) || 0) })}
                        disabled={!isEnabled}
                        placeholder="0"
                        className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor={`seats-${tool.name}`} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Seats
                      </label>
                      <input
                        type="number"
                        id={`seats-${tool.name}`}
                        min={1}
                        value={input.seats}
                        onChange={(e) => updateTool(index, { seats: Math.max(1, parseInt(e.target.value) || 1) })}
                        disabled={!isEnabled}
                        className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <span className="text-xs text-zinc-500">
                        ${(input.monthlySpend * input.seats).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || enabledCount === 0}
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {isSubmitting ? 'Analyzing...' : `Run Audit (${enabledCount} tool${enabledCount === 1 ? '' : 's'})`}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Form data saves automatically. Use at least one tool to proceed.
      </p>
    </form>
  );
}