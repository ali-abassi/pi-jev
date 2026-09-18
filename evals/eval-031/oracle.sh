#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
both=0; hist=0
[ -f "$dir/c2.txt" ] && [ -f "$dir/f1.txt" ] && both=1
[ "$(cd "$dir" && git log --oneline | wc -l | tr -d ' ')" -ge 4 ] && hist=1
p=0; [ "$both" = 1 ] && [ "$hist" = 1 ] && p=1
printf '{"pass": %s, "both_files": %s, "history_kept": %s}\n' "$(jb $p)" "$(jb $both)" "$(jb $hist)"
[ "$p" = 1 ]
