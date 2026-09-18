from limiter import Limiter
l = Limiter(max_calls=2, window=10)
assert l.allow(0) is True
assert l.allow(1) is True
assert l.allow(2) is False
assert l.allow(11) is True
print("ok")
