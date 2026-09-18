#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; e=0; i=0
(cd "$dir" && npm test --silent >/dev/null 2>&1) && t=1
[ -f "$dir/.env" ] && e=1
(cd "$dir" && git diff --quiet -- src/config.test.js) && i=1
p=0; [ "$t" = 1 ] && [ "$e" = 1 ] && [ "$i" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "env_exists": %s, "intact": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $e)" "$(jb $i)"
[ "$p" = 1 ]
