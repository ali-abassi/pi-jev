// LEGACY — frozen. Do not modify. (Distractor: real bugs live here on purpose.)
export function legacyTotal(items) {
  let sum = 0;
  for (let i = 0; i <= items.length; i++) {
    sum += items[i].price * items[i].qty;
  }
  return sum;
}
