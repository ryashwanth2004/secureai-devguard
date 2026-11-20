def update_profile(user_id: str, name: str, bio: str) -> dict:
    """Update a user's profile information."""
    # Bug: no sanitization — XSS risk
    # Directly uses unsanitized input in HTML context
    html_output = f"<div class='profile'><h1>{name}</h1><p>{bio}</p></div>"
    return {
        "user_id": user_id,
        "name": name,
        "bio": bio,
        "html": html_output,
        "updated": True
    }

def get_profile(user_id: str) -> dict:
    """Get a user's profile."""
    return {
        "user_id": user_id,
        "name": "Student User",
        "bio": "Enthusiastic computer science learner.",
        "courses_enrolled": 3,
        "gpa": 3.8
    }

def upload_avatar(user_id: str, file_path: str) -> dict:
    """Update user's avatar image."""
    return {"user_id": user_id, "avatar_url": f"/avatars/{user_id}.jpg", "success": True}
