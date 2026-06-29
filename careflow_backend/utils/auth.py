import secrets

from flask import request
from mysql.connector import Error
from werkzeug.security import check_password_hash, generate_password_hash

from database import get_db_connection


def hash_password(password):
    return generate_password_hash(password)


def verify_password(password_hash, password):
    return check_password_hash(password_hash, password)


def generate_session_token():
    return secrets.token_urlsafe(32)


def get_bearer_token():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    return token or None


def get_authenticated_user():
    token = get_bearer_token()

    if token is None:
        return None

    connection = get_db_connection()

    if connection is None:
        return None

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, email, full_name, role
            FROM users
            WHERE session_token = %s
            """,
            (token,),
        )
        return cursor.fetchone()
    except Error as error:
        print(f"Token validation error: {error}")
        return None
    finally:
        if cursor:
            cursor.close()
        connection.close()


def user_has_role(user, role):
    return user is not None and user.get("role") == role
