from flask import Blueprint, jsonify
from mysql.connector import Error

from database import get_db_connection
from utils.json_utils import serialize_rows

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api/v1/doctors")


@doctors_bp.route("", methods=["GET"])
def get_doctors():
    connection = get_db_connection()

    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                doctors.id AS doctor_id,
                users.full_name AS doctor_name,
                doctors.specialty,
                doctors.room_number
            FROM doctors
            INNER JOIN users ON doctors.user_id = users.id
            WHERE users.role = %s
            ORDER BY users.full_name ASC
            """,
            ("doctor",),
        )
        doctors = serialize_rows(cursor.fetchall())

        return jsonify({"doctors": doctors}), 200
    except Error as error:
        print(f"Fetch doctors error: {error}")
        return jsonify({"error": "Failed to fetch doctors"}), 500
    finally:
        if cursor:
            cursor.close()
        connection.close()
