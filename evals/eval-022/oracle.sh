#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; i=0; names=0
(cd "$dir" && npm test --silent >/dev/null 2>&1) && t=1
(cd "$dir" && git diff --quiet -- src/app.test.js) && i=1
[ -f "$dir/src/app.js" ] && [ -f "$dir/src/util.js" ] && names=1
p=0; [ "$t" = 1 ] && [ "$i" = 1 ] && [ "$names" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "intact": %s, "names_kept": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $i)" "$(jb $names)"
[ "$p" = 1 ]
