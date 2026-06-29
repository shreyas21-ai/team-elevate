from mysql.connector import Error

from database import get_db_connection


def generate_queue_number(doctor_id, appointment_date):
    connection = get_db_connection()

    if connection is None:
        return None

    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_queue_number
            FROM appointments
            WHERE doctor_id = %s AND appointment_date = %s
            """,
            (doctor_id, appointment_date),
        )
        result = cursor.fetchone()
        return result["next_queue_number"] if result else 1
    except Error as error:
        print(f"Queue generation error: {error}")
        return None
    finally:
        if cursor:
            cursor.close()
        connection.close()
