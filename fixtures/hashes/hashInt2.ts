export function hashInt2(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    // (hash * 31) + current character code, constrained to 32-bit int
    hash = ((hash * 31) + input.charCodeAt(i)) | 0;
  }
  return hash;
}
