#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; i=0; noreimpl=0
(cd "$dir" && python3 test_app.py >/dev/null 2>&1) && t=1
(cd "$dir" && git diff --quiet -- test_app.py) && i=1
grep -q "replace" "$dir/src/app.py" 2>/dev/null || noreimpl=1
p=0; [ "$t" = 1 ] && [ "$i" = 1 ] && [ "$noreimpl" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "intact": %s, "no_reimpl": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $i)" "$(jb $noreimpl)"
[ "$p" = 1 ]
