#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; i=0
ok=1
n=0
while [ "$n" -lt 5 ]; do
  (cd "$dir" && npm test --silent >/dev/null 2>&1) || ok=0
  n=$((n + 1))
done
[ "$ok" = 1 ] && t=1
(cd "$dir" && git diff --quiet -- src/order.test.js) && i=1
p=0; [ "$t" = 1 ] && [ "$i" = 1 ] && p=1
printf '{"pass": %s, "tests_5x": %s, "intact": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $i)"
[ "$p" = 1 ]
