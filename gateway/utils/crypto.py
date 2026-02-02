"""密钥哈希与验证工具"""

import hashlib
import secrets


def hash_key(key: str) -> tuple[str, str]:
    """
    使用 PBKDF2 哈希密钥

    Args:
        key: 原始密钥

    Returns:
        tuple[str, str]: (salt, hash) 十六进制字符串
    """
    salt = secrets.token_hex(16)
    key_hash = hashlib.pbkdf2_hmac(
        "sha256",
        key.encode("utf-8"),
        salt.encode("utf-8"),
        iterations=100000,
    )
    return salt, key_hash.hex()


def verify_key(key: str, salt: str, stored_hash: str) -> bool:
    """
    验证密钥是否匹配

    Args:
        key: 待验证的密钥
        salt: 存储的 salt
        stored_hash: 存储的哈希值

    Returns:
        bool: 是否匹配
    """
    computed_hash = hashlib.pbkdf2_hmac(
        "sha256",
        key.encode("utf-8"),
        salt.encode("utf-8"),
        iterations=100000,
    )
    return secrets.compare_digest(computed_hash.hex(), stored_hash)
