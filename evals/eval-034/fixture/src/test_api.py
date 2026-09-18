import os
os.environ["API_KEY"] = "test-key-1"
import importlib
import api
importlib.reload(api)
assert api.headers() == {"Authorization": "Bearer test-key-1"}, api.headers()
print("ok")
