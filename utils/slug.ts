export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}

export function varietyIdFromAgmarknetName(name: string): string {
  return `ag_${slugify(name)}`;
}
