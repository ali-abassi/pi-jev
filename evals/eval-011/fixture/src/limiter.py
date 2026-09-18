class Limiter:
    def __init__(self, max_calls, window):
        self.max_calls = max_calls
        self.window = window
        self.hits = []
    def allow(self, now):
        self.hits = [h for h in self.hits if now - h < self.window]
        if len(self.hits) > self.max_calls:
            return False
        self.hits.append(now)
        return True
