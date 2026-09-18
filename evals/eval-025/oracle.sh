#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
t=0
[ -f "$dir/codes.txt" ] && cmp -s "$dir/codes.txt" "$(dirname "$0")/expected.txt" && t=1
printf '{"pass": %s, "exact": %s}\n' "$(jb $t)" "$(jb $t)"
[ "$t" = 1 ]
