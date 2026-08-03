import { detectQueryTopics } from '@/services/ai/queryIntent';

import { AGENTS } from './definitions';
import type { AgentDefinition, AgentId } from './types';

const SCHEME_RE =
  /\b(pm-kisan|pmkisan|subsidy|insurance|kcc|kisan credit|scheme|yojana|pension|loan|rfctl|fasal bima)\b|పథక|సబ్సిడీ|బీమ|రుణ/i;

/** Pick one specialist agent — focused context reduces hallucination. */
export function routeToAgent(query: string): AgentDefinition {
  const q = query.trim();
  const topics = detectQueryTopics(q);

  if (topics.has('time') && topics.size === 1) return AGENTS.time;
  if (topics.has('pest')) return AGENTS.pest;
  if (topics.has('mandi')) return AGENTS.mandi;
  if (topics.has('fertilizer')) return AGENTS.fertilizer;
  if (topics.has('weather') && !topics.has('crop') && !topics.has('pest')) return AGENTS.weather;
  if (SCHEME_RE.test(q)) return AGENTS.scheme;
  if (topics.has('crop')) return AGENTS.crop;

  return AGENTS.general;
}

export function getAgentTemperature(agentId: AgentId | string): number {
  if (agentId in AGENTS) return AGENTS[agentId as AgentId].temperature;
  return 0.18;
}
