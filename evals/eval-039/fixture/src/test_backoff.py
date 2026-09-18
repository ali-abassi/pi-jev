from backoff import retry
calls = []
def flaky():
    calls.append(1)
    if len(calls) < 3:
        raise ValueError("boom")
    return "fine"
assert retry(flaky, 3, 0.5, lambda s: None) == "fine"
sleeps = []
def always():
    raise ValueError("x")
try:
    retry(always, 3, 0.5, sleeps.append)
    raise SystemExit("should have raised")
except ValueError:
    pass
assert sleeps == [0.5, 1.0], sleeps
print("ok")
