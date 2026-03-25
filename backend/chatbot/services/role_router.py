def normalize_role(role: str) -> str:
    role = (role or "student").strip().lower()
    return "teacher" if role == "teacher" else "student"