export function delays(baseMs, maxRetries) {
  const out = [];
  for (let i = 0; i <= maxRetries; i++) {
    out.push(baseMs * 2 ** i);
  }
  return out;
}
