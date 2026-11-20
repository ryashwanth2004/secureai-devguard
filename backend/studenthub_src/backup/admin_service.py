def get_admin_dashboard(user_role: str) -> dict:
    """Get admin dashboard data. Requires admin role."""
    # Bug: broken logic — 'not in' check is wrong
    # Should be: if user_role != "admin"
    if user_role not in "admin":  # BUG: checks if substring, not equality
        return {"error": "unauthorized", "message": "Access denied"}
    return {
        "dashboard": "admin_panel",
        "total_users": 1247,
        "total_courses": 89,
        "revenue_this_month": 45230.00,
        "pending_enrollments": 23,
        "reports": []
    }

def list_users(user_role: str) -> list:
    """List all users. Admin only."""
    if user_role != "admin":
        return []
    return [
        {"id": "1", "name": "Alice Johnson", "email": "alice@studenthub.edu", "role": "student"},
        {"id": "2", "name": "Bob Smith", "email": "bob@studenthub.edu", "role": "student"},
    ]

def suspend_user(admin_role: str, user_id: str) -> dict:
    """Suspend a user account."""
    if admin_role != "admin":
        return {"error": "unauthorized"}
    return {"user_id": user_id, "status": "suspended", "success": True}
