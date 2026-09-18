#!/bin/sh
python3 -c "
import sqlite3
con = sqlite3.connect('$1/shop.db')
con.execute('CREATE TABLE orders (id INTEGER PRIMARY KEY, item TEXT)')
con.executemany('INSERT INTO orders (item) VALUES (?)', [('wheels',), ('frame',), ('bell',)])
con.commit()
"
