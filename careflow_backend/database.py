import mysql.connector
from mysql.connector import Error

from config import DATABASE, HOST, PASSWORD, USER


def get_db_connection():
    try:
        return mysql.connector.connect(
            host=HOST,
            user=USER,
            password=PASSWORD,
            database=DATABASE,
        )
    except Error as error:
        print(f"Database connection error: {error}")
        return None


if __name__ == "__main__":
    connection = get_db_connection()

    if connection:
        print("Database Connected Successfully")
        connection.close()
