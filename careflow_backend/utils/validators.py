from datetime import datetime


def require_fields(data, fields):
    return [field for field in fields if data.get(field) in (None, "")]


def is_positive_integer(value):
    try:
        return int(value) > 0 and str(value).isdigit()
    except (TypeError, ValueError):
        return False


def is_valid_date(value):
    try:
        datetime.strptime(str(value), "%Y-%m-%d")
        return True
    except (TypeError, ValueError):
        return False


def is_valid_time(value):
    value = str(value)

    for time_format in ("%H:%M", "%H:%M:%S"):
        try:
            datetime.strptime(value, time_format)
            return True
        except ValueError:
            continue

    return False


def is_valid_appointment_status(status):
    return status in {"scheduled", "serving", "completed", "absent"}
