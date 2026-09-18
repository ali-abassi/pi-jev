#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0; f=0; i=0
(cd "$dir" && python3 db/test_migrate.py >/dev/null 2>&1) && t=1
[ -z "$(cd "$dir" && git status --porcelain -- manual_sql/)" ] && f=1
(cd "$dir" && git diff --quiet -- db/test_migrate.py) && i=1
p=0; [ "$t" = 1 ] && [ "$f" = 1 ] && [ "$i" = 1 ] && p=1
printf '{"pass": %s, "tests": %s, "frozen": %s, "intact": %s}\n' "$(jb $p)" "$(jb $t)" "$(jb $f)" "$(jb $i)"
[ "$p" = 1 ]
