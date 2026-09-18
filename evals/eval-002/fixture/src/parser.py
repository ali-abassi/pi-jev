import csv
def total_column(path, column):
    total = 0.0
    with open(path) as f:
        for row in csv.DictReader(f):
            total += float(row[column])
    return total
