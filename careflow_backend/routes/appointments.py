from datetime import date

from flask import Blueprint, jsonify, request
from mysql.connector import Error, IntegrityError

from database import get_db_connection
from utils.auth import get_authenticated_user, user_has_role
from utils.json_utils import serialize_rows
from utils.queue import generate_queue_number
from utils.validators import (
    is_positive_integer,
    is_valid_appointment_status,
    is_valid_date,
    is_valid_time,
    require_fields,
)

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/v1/appointments")


@appointments_bp.route("/my", methods=["GET"])
def get_my_appointments():
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Invalid or missing token"}), 401

    if not user_has_role(user, "patient"):
        return jsonify({"error": "Only patients can view their appointments"}), 403

    connection = get_db_connection()

    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                appointments.id AS appointment_id,
                appointments.patient_id,
                users.full_name AS patient_name,
                doctors.id AS doctor_id,
                doc_users.full_name AS doctor_name,
                doctors.specialty,
                doctors.room_number,
                appointments.appointment_date,
                appointments.time_slot,
                appointments.queue_number,
                appointments.status
            FROM appointments
            INNER JOIN users ON appointments.patient_id = users.id
            INNER JOIN doctors ON appointments.doctor_id = doctors.id
            INNER JOIN users AS doc_users ON doctors.user_id = doc_users.id
            WHERE appointments.patient_id = %s
            ORDER BY appointments.appointment_date DESC, appointments.time_slot DESC
            """,
            (user["id"],),
        )
        appointments = serialize_rows(cursor.fetchall())

        return jsonify({"appointments": appointments}), 200
    except Error as error:
        print(f"Fetch patient appointments error: {error}")
        return jsonify({"error": "Failed to fetch appointments"}), 500
    finally:
        if cursor:
            cursor.close()
        connection.close()


@appointments_bp.route("/book", methods=["POST"])
def book_appointment():
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Invalid or missing token"}), 401

    if not user_has_role(user, "patient"):
        return jsonify({"error": "Only patients can book appointments"}), 403

    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["doctor_id", "appointment_date", "time_slot"])

    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    doctor_id = data.get("doctor_id")
    appointment_date = data.get("appointment_date")
    time_slot = data.get("time_slot")

    if not is_positive_integer(doctor_id):
        return jsonify({"error": "doctor_id must be a positive integer"}), 400

    if not is_valid_date(appointment_date):
        return jsonify({"error": "appointment_date must use YYYY-MM-DD format"}), 400

    if not is_valid_time(time_slot):
        return jsonify({"error": "time_slot must use HH:MM or HH:MM:SS format"}), 400

    queue_number = generate_queue_number(doctor_id, appointment_date)

    if queue_number is None:
        return jsonify({"error": "Failed to generate queue number"}), 500

    connection = get_db_connection()

    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id
            FROM doctors
            WHERE id = %s
            """,
            (doctor_id,),
        )
        doctor = cursor.fetchone()

        if doctor is None:
            return jsonify({"error": "Doctor not found"}), 404

        cursor.execute(
            """
            INSERT INTO appointments (
                patient_id,
                doctor_id,
                appointment_date,
                time_slot,
                queue_number,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user["id"],
                doctor_id,
                appointment_date,
                time_slot,
                queue_number,
                "scheduled",
            ),
        )
        connection.commit()

        return jsonify(
            {
                "message": "Appointment booked successfully",
                "appointment_id": cursor.lastrowid,
                "queue_number": queue_number,
                "status": "scheduled",
            }
        ), 201
    except IntegrityError as error:
        connection.rollback()
        print(f"Appointment integrity error: {error}")
        return jsonify({"error": "Unable to book appointment. Please try again."}), 409
    except Error as error:
        connection.rollback()
        print(f"Book appointment error: {error}")
        return jsonify({"error": "Failed to book appointment"}), 500
    finally:
        if cursor:
            cursor.close()
        connection.close()


@appointments_bp.route("/doctor/today", methods=["GET"])
def get_doctor_today_appointments():
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Invalid or missing token"}), 401

    if not user_has_role(user, "doctor"):
        return jsonify({"error": "Only doctors can view today's appointments"}), 403

    connection = get_db_connection()

    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id
            FROM doctors
            WHERE user_id = %s
            """,
            (user["id"],),
        )
        doctor = cursor.fetchone()

        if doctor is None:
            return jsonify({"error": "Doctor profile not found"}), 404

        cursor.execute(
            """
            SELECT
                appointments.id AS appointment_id,
                appointments.patient_id,
                users.full_name AS patient_name,
                appointments.appointment_date,
                appointments.time_slot,
                appointments.queue_number,
                appointments.status
            FROM appointments
            INNER JOIN users ON appointments.patient_id = users.id
            WHERE appointments.doctor_id = %s
              AND appointments.appointment_date = %s
            ORDER BY appointments.queue_number ASC
            """,
            (doctor["id"], date.today()),
        )
        appointments = serialize_rows(cursor.fetchall())

        return jsonify({"appointments": appointments}), 200
    except Error as error:
        print(f"Fetch doctor appointments error: {error}")
        return jsonify({"error": "Failed to fetch today's appointments"}), 500
    finally:
        if cursor:
            cursor.close()
        connection.close()


@appointments_bp.route("/<int:appointment_id>/status", methods=["PATCH"])
def update_appointment_status(appointment_id):
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Invalid or missing token"}), 401

    if not user_has_role(user, "doctor"):
        return jsonify({"error": "Only doctors can update appointment status"}), 403

    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()

    if not is_valid_appointment_status(status):
        return jsonify({"error": "status must be one of: scheduled, serving, completed, absent"}), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id
            FROM doctors
            WHERE user_id = %s
            """,
            (user["id"],),
        )
        doctor = cursor.fetchone()

        if doctor is None:
            return jsonify({"error": "Doctor profile not found"}), 404

        cursor.execute(
            """
            SELECT id, doctor_id
            FROM appointments
            WHERE id = %s
            """,
            (appointment_id,),
        )
        appointment = cursor.fetchone()

        if appointment is None:
            return jsonify({"error": "Appointment not found"}), 404

        if appointment["doctor_id"] != doctor["id"]:
            return jsonify({"error": "You are not authorized to update this appointment"}), 403

        cursor.execute(
            """
            UPDATE appointments
            SET status = %s
            WHERE id = %s
            """,
            (status, appointment_id),
        )
        connection.commit()

        return jsonify(
            {
                "message": "Appointment status updated successfully",
                "appointment_id": appointment_id,
                "status": status,
            }
        ), 200
    except Error as error:
        connection.rollback()
        print(f"Update appointment status error: {error}")
        return jsonify({"error": "Failed to update appointment status"}), 500
    finally:
        if cursor:
            cursor.close()
        connection.close()
