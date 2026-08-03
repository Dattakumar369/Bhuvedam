export type AgentId =
  | 'time'
  | 'weather'
  | 'mandi'
  | 'pest'
  | 'fertilizer'
  | 'crop'
  | 'scheme'
  | 'general';

/** Agent-specific temperature — lower = less hallucination on factual topics */
const AGENT_TEMPERATURE: Record<AgentId, number> = {
  time: 0.1,
  weather: 0.2,
  mandi: 0.15,
  pest: 0.12,
  fertilizer: 0.15,
  crop: 0.2,
  scheme: 0.18,
  general: 0.22,
};

const DEFAULT_TEMPERATURE = 0.18;

export function isKnownAgentId(id?: string): id is AgentId {
  return Boolean(id && id in AGENT_TEMPERATURE);
}

export function resolveAgentTemperature(agentId?: string, voiceMode = false): number {
  const base = isKnownAgentId(agentId) ? AGENT_TEMPERATURE[agentId] : DEFAULT_TEMPERATURE;
  return voiceMode ? Math.min(base + 0.05, 0.3) : base;
}
