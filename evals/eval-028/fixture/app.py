import os
def timeout():
    return int(os.environ.get("TIMEOUT", "5000"))
