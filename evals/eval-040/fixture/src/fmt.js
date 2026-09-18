export function greet(name, cb) {
  setTimeout(() => cb(null, name ? `hi ${name}` : "hi stranger"), 1);
}
