import sys
sys.path.insert(0, "src")
from app import title_to_slug
assert title_to_slug("Hello World") == "hello-world"
assert title_to_slug("  A  B ") == "a--b"
print("ok")
