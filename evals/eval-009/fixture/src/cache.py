import time
class Cache:
    def __init__(self, ttl):
        self.ttl = ttl
        self.store = {}
    def set(self, key, value):
        self.store[key] = (value, time.time())
    def get(self, key, now=None):
        now = time.time() if now is None else now
        value, born = self.store[key]
        if now - born > self.ttl:
            del self.store[key]
            return None
        return value
