export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function countTokensForEntries(contents: string[]): number {
  return contents.reduce((sum, c) => sum + countTokens(c), 0);
}
