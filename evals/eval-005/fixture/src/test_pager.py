from pager import pages, page_count
assert pages([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]
assert pages([], 3) == []
assert page_count(5, 2) == 3
assert page_count(6, 2) == 3
print("ok")
