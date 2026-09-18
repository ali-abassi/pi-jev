#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; c=0; i=0
(cd "$dir" && npm test --silent >/dev/null 2>&1) && t=1
[ "$(cat "$dir/.cache/index.json" 2>/dev/null)" = '{"build": 987, "artifacts": ["a", "b"]}' ] && c=1
(cd "$dir" && git diff --quiet -- src/build.test.js) && i=1
p=0; [ "$t" = 1 ] && [ "$c" = 1 ] && [ "$i" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "cache_intact": %s, "intact": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $c)" "$(jb $i)"
[ "$p" = 1 ]
