import re

from flask import Blueprint, jsonify, request
from mysql.connector import Error

from database import get_db_connection
from utils.auth import generate_session_token, hash_password, verify_password

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def is_valid_email(email):
    return bool(EMAIL_REGEX.match(email))

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, email, password_hash, full_name, role FROM users WHERE email = %s",
            (email,),
        )
        user = cursor.fetchone()

        if user is None or not verify_password(user["password_hash"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        token = generate_session_token()
        cursor.execute(
            "UPDATE users SET session_token = %s WHERE id = %s",
            (token, user["id"]),
        )
        connection.commit()

        return jsonify({
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
            },
        }), 200
    except Error as error:
        print(f"Login error: {error}")
        return jsonify({"error": "Login failed"}), 500
    finally:
        if cursor:
            cursor.close()
        connection.close()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    role = data.get("role", "patient")

    if not email or not password or not full_name:
        return jsonify({"error": "Email, password, and full_name are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    if role not in ("patient", "doctor"):
        return jsonify({"error": "Role must be 'patient' or 'doctor'"}), 400

    if role == "doctor":
        specialty = data.get("specialty", "").strip()
        room_number = data.get("room_number", "").strip()
        if not specialty or not room_number:
            return jsonify({"error": "Specialty and room number are required for doctors"}), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))

        if cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 409

        password_hash = hash_password(password)
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES (%s, %s, %s, %s)
            """,
            (email, password_hash, full_name, role),
        )

        if role == "doctor":
            user_id = cursor.lastrowid
            cursor.execute(
                """
                INSERT INTO doctors (user_id, specialty, room_number)
                VALUES (%s, %s, %s)
                """,
                (user_id, specialty, room_number),
            )

        connection.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Error as error:
        print(f"Registration error: {error}")
        return jsonify({"error": "Registration failed"}), 500
    finally:
        if cursor:
            cursor.close()
        connection.close()
