from mdtable import parse
assert parse("| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |") == [
    {"a": "1", "b": "2"}, {"a": "3", "b": "4"}]
assert parse("name|age\n--|--\nal|30") == [{"name": "al", "age": "30"}]
print("ok")
