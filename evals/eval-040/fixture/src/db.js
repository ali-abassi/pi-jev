const USERS = { 1: "Ann", 2: "Bob" };
export function fetchUser(id, cb) {
  setTimeout(() => cb(null, USERS[id] ?? null), 1);
}
