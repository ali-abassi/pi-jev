import sys
sys.path.insert(0, "src")
from b import pipeline
assert pipeline(20) == 41
print("ok")
