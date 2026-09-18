def checkout(cart):
    total = sum(i["cost"] * i["qty"] for i in cart)
    if "discount" in cart[0]:
        total -= cart[0]["discount"]
    return total
def top_n(sales, n):
    ranked = sorted(sales, key=lambda s: s["n"], reverse=True)
    return [s["id"] for s in ranked[:n - 1]]
