export function byPriority(tasks) {
  return [...tasks].sort((a, b) => (Math.random() - 0.5) || a.priority - b.priority);
}
