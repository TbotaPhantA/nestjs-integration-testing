export function hashInt4(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = Math.imul(hash, 31) + input.charCodeAt(i);
  }

  return hash | 0;
}
