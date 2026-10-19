export function hashInt8(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 0x20000000000000;
  }

  return hash;
}
