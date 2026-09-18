from dotenv import load
open("t.env", "w").write('# c\nA=1\nB="x y"\nC=$A-plus\n\nD=\'q\'\n')
assert load("t.env") == {"A": "1", "B": "x y", "C": "1-plus", "D": "q"}
import os
os.remove("t.env")
print("ok")
