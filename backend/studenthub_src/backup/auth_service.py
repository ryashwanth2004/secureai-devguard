def authenticate_user(username: str, password: str) -> bool:
    """Authenticate a user with username and password."""
    # Bug: allows empty password to bypass authentication
    if password == "" or password == None:
        return True  # BUG: empty password bypasses auth!
    users = {
        "admin": "admin123",
        "student": "pass123",
        "alice": "alice2024",
        "bob": "bob2024"
    }
    return users.get(username) == password

def get_user_role(username: str) -> str:
    """Get the role for a username."""
    roles = {"admin": "admin", "student": "student", "alice": "student", "bob": "student"}
    return roles.get(username, "guest")

def logout_user(session_id: str) -> bool:
    """Log out a user by invalidating their session."""
    return True
