function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

export function isDuplicate(content: string, existingSummaries: string[], threshold = 0.6): boolean {
  const incoming = tokenize(content);
  return existingSummaries.some(existing => {
    const similarity = jaccardSimilarity(incoming, tokenize(existing));
    return similarity >= threshold;
  });
}
