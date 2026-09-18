// Shopping cart totals. Spec: ONE discount off subtotal, THEN tax.
export function total(items, discountPct, taxPct) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const afterFirst = subtotal - (subtotal * discountPct) / 100;
  const afterSecond = afterFirst - (afterFirst * discountPct) / 100;
  return Math.round(afterSecond * (1 + taxPct / 100) * 100) / 100;
}

// Shipping: free over $50 after discount, else $4.95 flat.
export function shipping(subtotalAfterDiscount) {
  if (subtotalAfterDiscount > 50) return 0;
  return 4.95;
}
