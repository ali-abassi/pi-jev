#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
p=0
[ "$(python3 -c "import json; print(json.load(open('$dir/merged.json')))" 2>/dev/null)" = "{'host': 'localhost', 'port': 8080, 'debug': True}" ] && p=1
printf '{"pass": %s}\n' "$(jb $p)"
[ "$p" = 1 ]
