# CareFlow Backend

Flask + MySQL backend for a Hospital Appointment and Patient Queue Management system.

## Features

- Flask application with Blueprints
- Flask-CORS enabled
- MySQL connection using `mysql-connector-python`
- Password hashing helpers using Werkzeug
- Session-token based authentication
- Patient appointment booking
- Automatic queue number generation
- Doctor queue view for today's appointments
- Doctor-only appointment status updates

## Project Structure

```text
backend/
  app.py
  config.py
  database.py
  requirements.txt
  schema.sql
  sample_inserts.sql
  CareFlow.postman_collection.json
  routes/
    auth.py
    doctors.py
    appointments.py
  models/
  utils/
    auth.py
    json_utils.py
    queue.py
    validators.py
```

## Setup

Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Database Setup

Create the database and tables:

```bash
mysql -u root -p < schema.sql
```

Load sample data:

```bash
mysql -u root -p careflow < sample_inserts.sql
```

The sample insert file uses placeholder password hashes. For real login support, replace them with hashes generated using:

```python
from utils.auth import hash_password
print(hash_password("Password@123"))
```

## Configuration

Defaults are defined in `config.py`:

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=careflow
```

You can override these with environment variables.

## Run

```bash
python app.py
```

Base URL:

```text
http://127.0.0.1:5000
```

## APIs

### GET /api/v1/doctors

Returns all doctors.

### POST /api/v1/appointments/book

Requires patient token:

```text
Authorization: Bearer <patient_session_token>
```

Body:

```json
{
  "doctor_id": 1,
  "appointment_date": "2026-06-27",
  "time_slot": "10:30:00"
}
```

### GET /api/v1/appointments/doctor/today

Requires doctor token:

```text
Authorization: Bearer <doctor_session_token>
```

### PATCH /api/v1/appointments/<id>/status

Requires doctor token.

Body:

```json
{
  "status": "serving"
}
```

Allowed statuses:

- `scheduled`
- `serving`
- `completed`
- `absent`

## Postman

Import `CareFlow.postman_collection.json` into Postman and update collection variables as needed:

- `base_url`
- `patient_token`
- `doctor_token`
- `appointment_id`

## Review Notes

- SQL inputs use parameterized queries.
- Cursors and database connections are closed in `finally` blocks.
- Role checks protect patient and doctor actions.
- Appointment queue numbers are protected by a database-level unique constraint.
- In a high-concurrency production system, appointment booking should use a transaction lock or retry strategy around queue generation.
