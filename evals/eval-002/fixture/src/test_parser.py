from parser import total_column
assert total_column("src/data.csv", "amount") == 13.75, "empty cells must be skipped"
assert total_column("src/data.csv", "amount") > 0
print("ok")
