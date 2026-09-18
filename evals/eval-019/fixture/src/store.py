import json
PATH = "data/out.json"
def save(obj):
    with open(PATH, "w") as f:
        json.dump(obj, f)
def load():
    with open(PATH) as f:
        return json.load(f)
