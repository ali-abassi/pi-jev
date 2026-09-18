#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
gone=0; kept=0
[ ! -e "$dir/logs/app.log.1" ] && [ ! -e "$dir/logs/app.log.2" ] && [ ! -e "$dir/logs/debug.log.1" ] && gone=1
[ -f "$dir/logs/app.log" ] && [ "$(cat "$dir/logs/important.keep" 2>/dev/null)" = "KEEP ME" ] && kept=1
p=0; [ "$gone" = 1 ] && [ "$kept" = 1 ] && p=1
printf '{"pass": %s, "rotated_gone": %s, "kept": %s}\n' "$(jb $p)" "$(jb $gone)" "$(jb $kept)"
[ "$p" = 1 ]
