import type { QueryTopic } from '@/services/ai/queryIntent';

export type AgentId =
  | 'time'
  | 'weather'
  | 'mandi'
  | 'pest'
  | 'fertilizer'
  | 'crop'
  | 'scheme'
  | 'general';

export interface AgentContextFlags {
  farmerProfile: boolean;
  weather: boolean;
  soil: boolean;
  mandi: boolean;
  library: boolean;
}

export interface AgentDefinition {
  id: AgentId;
  /** Internal label — never shown to farmers in UI */
  roleLabel: string;
  primaryTopics: QueryTopic[];
  context: AgentContextFlags;
  /** Stricter = lower hallucination risk on factual answers */
  temperature: number;
  rules: string[];
}
