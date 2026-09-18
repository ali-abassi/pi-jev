from cache import Cache
c = Cache(ttl=10)
c.set("a", 1)
assert c.get("a", now=100.0 + 5) == 1
# exactly at ttl boundary the entry is expired
c2 = Cache(ttl=10)
c2.store["k"] = ("v", 50.0)
assert c2.get("k", now=60.0) is None
assert "k" not in c2.store
print("ok")
