export function hashInt2(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }

  // Convert signed int32 → signed int16
  const value = hash & 0xffff;
  return value >= 0x8000 ? value - 0x10000 : value;
}

