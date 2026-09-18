import sqlite3
def migrate(path):
    con = sqlite3.connect(path)
    con.execute("ALTER TABLE users ADD COLUMN email TEXT")
    con.execute("UPDATE users SET email = name || '@example.com'")
    con.commit()
    con.close()
