/** Source priority for Bhuvedam knowledge ranking (lower = higher trust). */
export const PUBLICATION_SOURCE_PRIORITY: Record<string, number> = {
  icar: 1,
  pjtsau: 2,
  angrau: 3,
  university_research: 4,
  fao: 5,
  gov_advisory: 6,
  openalex: 7,
  openalex_pest: 7,
  openalex_chem: 7,
  openlibrary: 8,
  icar_consensus: 1,
  ai_cache: 99,
  web_research: 99,
};

export type PublicationKnowledgeType =
  | 'guide'
  | 'research'
  | 'disease'
  | 'pest'
  | 'fertilizer'
  | 'book'
  | 'general';

export interface PublicationEntry {
  id: string;
  /** DB source key — maps to PUBLICATION_SOURCE_PRIORITY */
  source: keyof typeof PUBLICATION_SOURCE_PRIORITY | string;
  type: PublicationKnowledgeType;
  title: string;
  titleTe?: string;
  summary: string;
  content: string;
  authors?: string[];
  url?: string;
  cropTags?: string[];
  tags?: string[];
  season?: string;
  state?: string;
  publisher?: string;
  documentType?: 'publication' | 'bulletin' | 'package_of_practices' | 'advisory' | 'research_paper';
  publishedYear?: number;
}

export function publicationPriority(source: string): number {
  return PUBLICATION_SOURCE_PRIORITY[source] ?? 50;
}
