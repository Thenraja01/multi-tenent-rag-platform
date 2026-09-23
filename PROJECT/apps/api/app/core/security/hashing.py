"""
Argon2id and cryptographic hashing utilities.
"""
import hashlib
import hmac
import secrets
import argon2

_hasher = argon2.PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MB
    parallelism=4,
    hash_len=32,
    type=argon2.Type.ID,
)


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2id."""
    if not password:
        raise ValueError("Password cannot be empty")
    return _hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against an Argon2id or legacy hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        if hashed_password.startswith("$argon2"):
            return _hasher.verify(hashed_password, plain_password)
        calc_sha = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
        return hmac.compare_digest(calc_sha, hashed_password)
    except Exception:
        return False


def hash_token(raw_token: str) -> str:
    """Hash a token (such as a refresh token) using SHA256 before database storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_random_token(nbytes: int = 32) -> str:
    """Generate cryptographically secure URL-safe random token."""
    return secrets.token_urlsafe(nbytes)
