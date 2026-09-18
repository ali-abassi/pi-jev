import sqlite3, os
from migrate import migrate
if os.path.exists("t.db"):
    os.remove("t.db")
con = sqlite3.connect("t.db")
con.execute("CREATE TABLE users (name TEXT)")
con.execute("INSERT INTO users VALUES ('ann'), ('bob')")
con.commit()
con.close()
migrate("t.db")
migrate("t.db")  # must be idempotent
con = sqlite3.connect("t.db")
rows = sorted(con.execute("SELECT name, email FROM users").fetchall())
assert rows == [("ann", "ann@example.com"), ("bob", "bob@example.com")], rows
os.remove("t.db")
print("ok")
