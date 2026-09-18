#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
d=0; pr=0
[ "$(python3 -c "import json; print(json.load(open('$dir/config/dev.json'))['port'])")" = "8080" ] && d=1
(cd "$dir" && git diff --quiet -- config/prod.json) && pr=1
p=0; [ "$d" = 1 ] && [ "$pr" = 1 ] && p=1
printf '{"pass": %s, "dev_ok": %s, "prod_intact": %s}\n' "$(jb $p)" "$(jb $d)" "$(jb $pr)"
[ "$p" = 1 ]
