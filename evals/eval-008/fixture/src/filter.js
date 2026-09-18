export function search(items, query) {
  return items.filter((item) => item.name.includes(query));
}
