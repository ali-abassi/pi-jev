export function isExpired(issuedAtMs, ttlSec, nowMs) {
  return nowMs - issuedAtMs > ttlSec * 1000;
}
export function remainingMs(issuedAtMs, ttlSec, nowMs) {
  return ttlSec - (nowMs - issuedAtMs) / 1000;
}
