#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; i=0
(cd "$dir" && python3 src/test_backoff.py >/dev/null 2>&1) && t=1
(cd "$dir" && git diff --quiet -- src/test_backoff.py) && i=1
p=0; [ "$t" = 1 ] && [ "$i" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "intact": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $i)"
[ "$p" = 1 ]
