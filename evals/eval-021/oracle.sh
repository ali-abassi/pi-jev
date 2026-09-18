#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; i=0
(cd "$dir" && python3 test_words.py >/dev/null 2>&1) && t=1
(cd "$dir" && git diff --quiet -- test_words.py) && i=1
p=0; [ "$t" = 1 ] && [ "$i" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "intact": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $i)"
[ "$p" = 1 ]
