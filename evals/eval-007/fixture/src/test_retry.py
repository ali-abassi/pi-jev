from retry import with_retry
calls = []
def flaky():
    calls.append(1)
    if len(calls) < 3:
        raise ValueError("boom")
    return "fine"
assert with_retry(flaky, 3) == "fine"
sleeps = []
def always():
    raise ValueError("x")
try:
    with_retry(always, 3, backoff=0.5, sleep=sleeps.append)
    raise SystemExit("should have raised")
except ValueError:
    pass
assert sleeps == [0.5, 1.0], sleeps
print("ok")
