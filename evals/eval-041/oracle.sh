#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"; ev="$(dirname "$0")"
a=0; b=0; c=0
(cd "$dir" && python3 src/csv2json.py src/data.csv 2>/dev/null | cmp -s - "$ev/exp1.txt") && a=1
(cd "$dir" && python3 src/csv2json.py src/data.csv --only name,amount --limit 2 2>/dev/null | cmp -s - "$ev/exp2.txt") && b=1
(cd "$dir" && python3 src/csv2json.py src/data.csv --pretty 2>/dev/null | cmp -s - "$ev/exp3.txt") && c=1
p=0; [ "$a" = 1 ] && [ "$b" = 1 ] && [ "$c" = 1 ] && p=1
printf '{"pass": %s, "default": %s, "subset": %s, "pretty": %s}\n' "$(jb $p)" "$(jb $a)" "$(jb $b)" "$(jb $c)"
[ "$p" = 1 ]
