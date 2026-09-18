import os, shutil
from store import save, load
if os.path.exists("data"):
    shutil.rmtree("data")
save({"a": 1})
assert load() == {"a": 1}
print("ok")
