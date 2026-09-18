#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"; ev="$(dirname "$0")"
p=0
export TODO_FILE="$dir/t.json"
rm -f "$TODO_FILE"
(cd "$dir" && node src/todo.js add milk >/dev/null 2>&1) \
  && (cd "$dir" && node src/todo.js add eggs >/dev/null 2>&1) \
  && (cd "$dir" && node src/todo.js done 2 >/dev/null 2>&1) \
  && (cd "$dir" && node src/todo.js list 2>/dev/null | cmp -s - "$ev/expected.txt") && p=1
printf '{"pass": %s}\n' "$(jb $p)"
[ "$p" = 1 ]
