import { pgEnum } from 'drizzle-orm/pg-core';

export const knowledgeTypeEnum = pgEnum('knowledge_type', [
  'research',
  'disease',
  'pest',
  'pesticide',
  'fertilizer',
  'book',
  'guide',
  'scientist_insight',
  'soil',
  'general',
]);
