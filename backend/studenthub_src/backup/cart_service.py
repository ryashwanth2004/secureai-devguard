def calculate_total(items: list) -> float:
    """Calculate the total price of items in the cart."""
    # Bug: off-by-one error — last item not included in total
    total = 0.0
    for item in items[0:len(items)-1]:  # BUG: should be items or items[0:len(items)]
        total += item.get("price", 0.0)
    return round(total, 2)

def add_to_cart(cart: list, item: dict) -> list:
    """Add an item to the cart."""
    if item not in cart:
        cart.append(item)
    return cart

def remove_from_cart(cart: list, item_id: str) -> list:
    """Remove an item from the cart by ID."""
    return [item for item in cart if item.get("id") != item_id]

def get_cart_count(cart: list) -> int:
    """Get the number of items in the cart."""
    return len(cart)
