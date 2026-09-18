#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; i=0
(cd "$dir" && TZ=Pacific/Kiritimati npm test --silent >/dev/null 2>&1) && (cd "$dir" && TZ=America/New_York npm test --silent >/dev/null 2>&1) && t=1
(cd "$dir" && git diff --quiet -- src/report.test.js) && i=1
p=0; [ "$t" = 1 ] && [ "$i" = 1 ] && p=1
printf '{"pass": %s, "tests_both_tz": %s, "intact": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $i)"
[ "$p" = 1 ]
