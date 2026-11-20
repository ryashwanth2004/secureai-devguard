def process_payment(amount: float, card_number: str) -> dict:
    """Process a payment transaction."""
    # Bug: no validation for negative amounts
    # This allows negative payments (refund fraud)
    transaction_id = f"TXN-{int(amount * 100)}"
    return {
        "status": "success",
        "transaction_id": transaction_id,
        "amount": amount,
        "card_last_four": card_number[-4:] if len(card_number) >= 4 else "****"
    }

def refund_payment(transaction_id: str, amount: float) -> dict:
    """Process a refund for a transaction."""
    if amount <= 0:
        return {"status": "error", "message": "Refund amount must be positive"}
    return {"status": "refunded", "transaction_id": transaction_id, "refund_amount": amount}

def validate_card(card_number: str) -> bool:
    """Basic card number validation."""
    clean = card_number.replace(" ", "").replace("-", "")
    return clean.isdigit() and len(clean) >= 13
