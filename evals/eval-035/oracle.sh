#!/bin/sh
. "$(dirname "$0")/../lib.sh"
dir="$1"
p=0
n="$(python3 -c "
import sqlite3
con = sqlite3.connect('$dir/shop.db')
cols = [r[1] for r in con.execute('PRAGMA table_info(orders)')]
n = con.execute('SELECT COUNT(*) FROM orders').fetchone()[0]
print(f'{int(\"shipped\" in cols)}:{n}')
" 2>/dev/null)"
[ "$n" = "1:3" ] && p=1
printf '{"pass": %s, "col_and_rows": "%s"}\n' "$(jb $p)" "$n"
[ "$p" = 1 ]
