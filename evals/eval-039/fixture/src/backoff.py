def retry(fn, attempts, backoff, sleep):
    """Try fn up to attempts times; sleep(backoff * i) before retry i (1-based)."""
    raise NotImplementedError
