def pages(items, per_page):
    return [items[i:i + per_page - 1] for i in range(0, len(items), per_page)]
def page_count(total, per_page):
    return total // per_page
