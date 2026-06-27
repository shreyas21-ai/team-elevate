import os
import jwt
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///loanflow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'loanflow-secret-key-change-in-production'

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role}


class LoanApplication(db.Model):
    __tablename__ = 'loan_applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    purpose = db.Column(db.String(500), nullable=False)
    monthly_income = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    risk_score = db.Column(db.Integer, nullable=True)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'purpose': self.purpose,
            'monthly_income': self.monthly_income,
            'status': self.status,
            'risk_score': self.risk_score,
            'reviewed_by': self.reviewed_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token[7:], app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in roles:
                return jsonify({'message': 'Forbidden: insufficient role'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body is required'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token, 'role': user.role, 'name': user.name, 'user_id': user.id})


@app.route('/api/v1/loans/apply', methods=['POST'])
@token_required
@role_required('customer')
def apply_loan(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body is required'}), 400

    amount = data.get('amount')
    purpose = data.get('purpose')
    monthly_income = data.get('monthly_income')

    missing = []
    if not amount: missing.append('amount')
    if not purpose: missing.append('purpose')
    if not monthly_income: missing.append('monthly_income')
    if missing:
        return jsonify({'message': f'Missing required fields: {", ".join(missing)}'}), 400

    try:
        amount = float(amount)
        monthly_income = float(monthly_income)
    except (ValueError, TypeError):
        return jsonify({'message': 'Amount and monthly_income must be numbers'}), 400

    if amount <= 0:
        return jsonify({'message': 'Amount must be positive'}), 400
    if monthly_income <= 0:
        return jsonify({'message': 'Monthly income must be positive'}), 400
    if not purpose.strip():
        return jsonify({'message': 'Purpose cannot be empty'}), 400

    application = LoanApplication(
        user_id=current_user.id,
        amount=amount,
        purpose=purpose.strip(),
        monthly_income=monthly_income,
        status='pending',
    )
    db.session.add(application)
    db.session.commit()

    log = AuditLog(user_id=current_user.id, action='loan_created', details=f'Application #{application.id} created')
    db.session.add(log)
    db.session.commit()

    return jsonify(application.to_dict()), 201


@app.route('/api/v1/loans/my-applications', methods=['GET'])
@token_required
@role_required('customer')
def my_applications(current_user):
    applications = LoanApplication.query.filter_by(user_id=current_user.id)\
        .order_by(LoanApplication.created_at.desc()).all()
    return jsonify([app.to_dict() for app in applications])


@app.route('/api/v1/loans/pending', methods=['GET'])
@token_required
@role_required('officer')
def pending_applications(current_user):
    applications = LoanApplication.query.filter_by(status='pending')\
        .order_by(LoanApplication.created_at.asc()).all()
    return jsonify([app.to_dict() for app in applications])


@app.route('/api/v1/loans/<int:id>/action', methods=['POST'])
@token_required
@role_required('officer')
def review_loan_action(current_user, id):
    application = LoanApplication.query.get(id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404
    if application.status != 'pending':
        return jsonify({'message': 'Application has already been reviewed'}), 400

    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body is required'}), 400

    action = data.get('action')
    if action not in ('approved', 'rejected'):
        return jsonify({'message': 'Action must be "approved" or "rejected"'}), 400

    application.status = action
    application.reviewed_by = current_user.id
    application.updated_at = datetime.datetime.utcnow()

    if action == 'approved':
        risk_score = data.get('risk_score')
        if risk_score is not None:
            try:
                application.risk_score = min(100, max(0, int(risk_score)))
            except (ValueError, TypeError):
                application.risk_score = 75
        else:
            ratio = application.monthly_income / application.amount if application.amount > 0 else 0
            application.risk_score = min(100, max(0, round(ratio * 100)))

    db.session.commit()

    log = AuditLog(
        user_id=current_user.id,
        action=f'loan_{action}',
        details=f'Application #{application.id} {action} by officer #{current_user.id}',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(application.to_dict())


def seed_data():
    with app.app_context():
        db.create_all()
        if User.query.first() is None:
            customer = User(
                name='Alice Johnson',
                email='alice@example.com',
                password_hash=generate_password_hash('password123'),
                role='customer',
            )
            officer = User(
                name='Bob Smith',
                email='bob@example.com',
                password_hash=generate_password_hash('password123'),
                role='officer',
            )
            db.session.add_all([customer, officer])
            db.session.commit()

            app1 = LoanApplication(
                user_id=customer.id, amount=15000, purpose='Home renovation',
                monthly_income=5000, status='pending',
            )
            app2 = LoanApplication(
                user_id=customer.id, amount=5000, purpose='Debt consolidation',
                monthly_income=3000, status='approved', risk_score=78, reviewed_by=officer.id,
            )
            app3 = LoanApplication(
                user_id=customer.id, amount=25000, purpose='Business expansion',
                monthly_income=8000, status='pending',
            )
            db.session.add_all([app1, app2, app3])
            db.session.commit()

            logs = [
                AuditLog(user_id=customer.id, action='loan_created', details='Application #1 created'),
                AuditLog(user_id=officer.id, action='loan_approved', details='Application #2 approved by officer #2'),
                AuditLog(user_id=customer.id, action='loan_created', details='Application #3 created'),
            ]
            db.session.add_all(logs)
            db.session.commit()

            print('Database seeded successfully')
            print('  Customer: alice@example.com / password123')
            print('  Officer:  bob@example.com   / password123')


if __name__ == '__main__':
    seed_data()
    app.run(debug=True, port=5000)
