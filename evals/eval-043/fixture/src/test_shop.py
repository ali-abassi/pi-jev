from shop import checkout, top_n
assert checkout([{"price": 10, "qty": 2}]) == 20
assert checkout([{"price": 10, "qty": 2, "discount": 5}]) == 15
assert top_n([{"id": "a", "n": 1}, {"id": "b", "n": 5}, {"id": "c", "n": 3}], 2) == ["b", "c"]
print("ok")
