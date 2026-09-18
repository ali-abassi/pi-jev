#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
mode=0; runs=0
[ "$(stat -f %p "$dir/bin/job.sh" 2>/dev/null || stat -c %a "$dir/bin/job.sh" 2>/dev/null)" = "100755" ] || [ "$(stat -c %a "$dir/bin/job.sh" 2>/dev/null)" = "755" ] && mode=1
[ "$(sh "$dir/bin/job.sh" 2>/dev/null)" = "job done" ] && runs=1
p=0; [ "$mode" = 1 ] && [ "$runs" = 1 ] && p=1
printf '{"pass": %s, "mode_755": %s, "runs": %s}\n' "$(jb $p)" "$(jb $mode)" "$(jb $runs)"
[ "$p" = 1 ]
