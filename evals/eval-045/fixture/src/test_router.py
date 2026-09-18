from router import Router
r = Router()
r.add("GET", "/u/:id", "show")
r.add("POST", "/u", "create")
h, p = r.match("GET", "/u/42")
assert (h, p) == ("show", {"id": "42"}), (h, p)
assert r.match("GET", "/u") is None
assert r.match("DELETE", "/u/42") is None
h2, p2 = r.match("POST", "/u")
assert (h2, p2) == ("create", {})
print("ok")
