"""Security rules for detecting and patching software bugs in StudentHub source modules."""
import re

def _apply_cart_patch(code: str) -> str:
    # Replace off-by-one slice with clean iteration over all items
    patched = code.replace(
        "for item in items[0:len(items)-1]:",
        "for item in items:  # Fixed: include all items in cart total"
    )
    if patched == code:
        # Alternative pattern matching
        patched = re.sub(
            r'for\s+item\s+in\s+items\[0:len\(items\)-1\]:',
            'for item in items:  # Fixed: include all items in cart total',
            code
        )
    return patched

def _apply_auth_patch(code: str) -> str:
    # Replace empty password bypass with strict verification
    old_pattern = """    # Bug: allows empty password to bypass authentication
    if password == "" or password == None:
        return True  # BUG: empty password bypasses auth!"""
    
    new_pattern = """    # Fixed: empty passwords strictly rejected
    if not password or password.strip() == "":
        return False  # Fixed: rejected empty credentials"""
        
    if old_pattern in code:
        return code.replace(old_pattern, new_pattern)
        
    # Regex fallback
    return re.sub(
        r'if\s+password\s*==\s*["\']["\']\s*or\s*password\s*==\s*None:\s*\n\s*return\s+True.*?\n',
        'if not password or password.strip() == "":\n        return False  # Fixed: rejected empty credentials\n',
        code
    )

def _apply_payment_patch(code: str) -> str:
    # Add input validation for negative or zero amounts
    old_code = (
        '    # Bug: no validation for negative amounts\n'
        '    # This allows negative payments (refund fraud)\n'
        '    transaction_id = f"TXN-{int(amount * 100)}"'
    )
    new_code = (
        '    # Fixed: validate amount is positive to prevent financial fraud\n'
        '    if amount <= 0:\n'
        '        raise ValueError(f"Invalid payment amount: {amount}. Payment amount must be strictly greater than 0.")\n'
        '    transaction_id = f"TXN-{int(amount * 100)}"'
    )
    
    if old_code in code:
        return code.replace(old_code, new_code)
    
    # Generic replacement
    return code.replace(
        'transaction_id = f"TXN-{int(amount * 100)}"',
        'if amount <= 0:\n        raise ValueError(f"Invalid payment amount: {amount}. Payment amount must be strictly greater than 0.")\n    transaction_id = f"TXN-{int(amount * 100)}"'
    )

def _apply_profile_patch(code: str) -> str:
    # Add HTML sanitization to prevent XSS
    old_code = (
        '    # Bug: no sanitization — XSS risk\n'
        '    # Directly uses unsanitized input in HTML context\n'
        '    html_output = f"<div class=\'profile\'><h1>{name}</h1><p>{bio}</p></div>"'
    )
    new_code = (
        '    # Fixed: sanitize user inputs before rendering to prevent XSS (CWE-79)\n'
        '    import html\n'
        '    safe_name = html.escape(str(name))\n'
        '    safe_bio = html.escape(str(bio))\n'
        '    html_output = f"<div class=\'profile\'><h1>{safe_name}</h1><p>{safe_bio}</p></div>"'
    )
    
    if old_code in code:
        return code.replace(old_code, new_code)
        
    return code.replace(
        'html_output = f"<div class=\'profile\'><h1>{name}</h1><p>{bio}</p></div>"',
        'import html\n    safe_name = html.escape(str(name))\n    safe_bio = html.escape(str(bio))\n    html_output = f"<div class=\'profile\'><h1>{safe_name}</h1><p>{safe_bio}</p></div>"'
    )

def _apply_admin_patch(code: str) -> str:
    # Fix substring 'not in' check to strict equality check
    old_code = 'if user_role not in "admin":  # BUG: checks if substring, not equality'
    new_code = 'if user_role != "admin":  # Fixed: strict role equality check (CWE-285)'
    
    if old_code in code:
        return code.replace(old_code, new_code)
        
    return code.replace('user_role not in "admin"', 'user_role != "admin"')

SECURITY_RULES = [
    {
        "rule_id": "RULE-001",
        "name": "Off-by-One Error in Cart Total Calculation",
        "file_pattern": "cart_service.py",
        "pattern": r'items\[0:len\(items\)-1\]',
        "cwe": "CWE-193",
        "severity": "LOW",  # Cart total calculation is a business logic bug with low security impact -> perfect for LOW risk auto-deploy demo!
        "bug_type": "Off-by-One Calculation Error",
        "description": "The calculate_total function slices the cart items using items[0:len(items)-1], omitting the final item in the array from the calculated total.",
        "why_problem": "When a student purchases multiple courses, the last course in their cart is systematically excluded from the billing sum. This causes financial accounting errors and undercharges students.",
        "apply_patch": _apply_cart_patch,
        "patch_explanation": "Replace items[0:len(items)-1] with the entire items list directly ('for item in items:'). This guarantees every item in the cart is accumulated into the final total price."
    },
    {
        "rule_id": "RULE-002",
        "name": "Empty Password Authentication Bypass",
        "file_pattern": "auth_service.py",
        "pattern": r'if\s+password\s*==\s*["\']["\']\s*or\s*password\s*==\s*None',
        "cwe": "CWE-287",
        "severity": "HIGH",
        "bug_type": "Authentication Bypass",
        "description": "The authentication function permits empty or None passwords to bypass the authentication check, returning True without verifying credentials.",
        "why_problem": "An attacker can authenticate as any student or administrative account simply by submitting an empty password string, gaining full unauthorized access to the portal.",
        "apply_patch": _apply_auth_patch,
        "patch_explanation": "Add strict validation to reject empty, null, or whitespace-only passwords immediately (returning False), ensuring password verification against password database is never bypassed."
    },
    {
        "rule_id": "RULE-003",
        "name": "Improper Input Validation - Negative Payment Amount",
        "file_pattern": "payment_service.py",
        "pattern": r'def\s+process_payment\(amount:\s*float',
        "cwe": "CWE-20",
        "severity": "HIGH",
        "bug_type": "Improper Input Validation",
        "description": "The payment gateway processing function fails to validate that the transaction amount is positive, permitting zero or negative values.",
        "why_problem": "Submitting a negative payment amount can lead to unauthorized refunds, balance tampering, and fraudulent accounting discrepancies in student financial ledgers.",
        "apply_patch": _apply_payment_patch,
        "patch_explanation": "Add guard clause validation at the entry of process_payment to ensure amount is strictly greater than zero, raising ValueError on non-positive amounts."
    },
    {
        "rule_id": "RULE-004",
        "name": "Stored / Reflected Cross-Site Scripting (XSS)",
        "file_pattern": "profile_service.py",
        "pattern": r'html_output\s*=\s*f".*\{name\}.*\{bio\}',
        "cwe": "CWE-79",
        "severity": "HIGH",
        "bug_type": "Cross-Site Scripting (XSS)",
        "description": "User profile inputs (name and bio) are directly interpolated into HTML without escaping or sanitization.",
        "why_problem": "An attacker can inject malicious HTML/JavaScript tags (e.g., <script> or <img onerror=...>) into profile fields, leading to session hijacking, credential harvesting, or defacement.",
        "apply_patch": _apply_profile_patch,
        "patch_explanation": "Encode all user-supplied profile strings with html.escape() prior to HTML template interpolation, neutralizing dangerous HTML and script tags."
    },
    {
        "rule_id": "RULE-005",
        "name": "Broken Access Control - Flawed Role Validation",
        "file_pattern": "admin_service.py",
        "pattern": r'if\s+user_role\s+not\s+in\s+["\']admin["\']',
        "cwe": "CWE-285",
        "severity": "HIGH",
        "bug_type": "Broken Access Control",
        "description": "The admin authorization check tests substring membership ('not in \"admin\"') instead of exact role equivalence ('!= \"admin\"').",
        "why_problem": "Any user with roles like 'a', 'ad', 'adm', 'd', 'min' or any substring of 'admin' bypasses the security check and gains full administrative privileges.",
        "apply_patch": _apply_admin_patch,
        "patch_explanation": "Replace the substring check with strict equality comparison ('if user_role != \"admin\":') to enforce exact role verification."
    }
]
