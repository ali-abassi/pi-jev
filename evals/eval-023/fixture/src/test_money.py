from money import total
assert total([{"price": 0.1, "qty": 1}, {"price": 0.2, "qty": 1}]) == 0.3
assert total([{"price": 19.99, "qty": 3}]) == 59.97
print("ok")
