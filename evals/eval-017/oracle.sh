#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; i=0; both=0
(cd "$dir" && python3 run.py >/dev/null 2>&1) && t=1
(cd "$dir" && git diff --quiet -- run.py) && i=1
[ -f "$dir/src/a.py" ] && [ -f "$dir/src/b.py" ] && both=1
p=0; [ "$t" = 1 ] && [ "$i" = 1 ] && [ "$both" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "intact": %s, "both kept": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $i)" "$(jb $both)"
[ "$p" = 1 ]
