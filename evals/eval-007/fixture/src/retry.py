def with_retry(fn, attempts, backoff=0, sleep=lambda s: None):
    last = None
    for _ in range(attempts - 1):
        try:
            return fn()
        except Exception as e:
            last = e
    raise last
