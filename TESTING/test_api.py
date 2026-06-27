"""
LoanFlow API Test Script
Run: python test_api.py
"""

import json
import urllib.request
import urllib.error

BASE = 'http://localhost:5000/api/v1'
passed = 0
failed = 0

def req(method, path, data=None, token=None):
    url = f'{BASE}{path}'
    body = json.dumps(data).encode() if data else None
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'

    try:
        r = urllib.request.Request(url, data=body, headers=headers, method=method)
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read()) if e.read() else {'message': 'Unknown error'}
    except Exception as e:
        return 0, {'message': str(e)}

def test(name, condition):
    global passed, failed
    if condition:
        passed += 1
        print(f'  PASS: {name}')
    else:
        failed += 1
        print(f'  FAIL: {name}')

print('\n=== Day 1: Auth & Setup ===\n')

status, data = req('POST', '/auth/login', {'email': 'alice@example.com', 'password': 'password123'})
test('Login customer returns 200', status == 200)
test('Login returns token', bool(data.get('token')))
test('Login returns role=customer', data.get('role') == 'customer')
test('Login returns name', data.get('name') == 'Alice Johnson')
CUSTOMER_TOKEN = data.get('token')
CUSTOMER_ID = data.get('user_id')

status, data = req('POST', '/auth/login', {'email': 'bob@example.com', 'password': 'password123'})
test('Login officer returns 200', status == 200)
test('Officer login returns role=officer', data.get('role') == 'officer')
OFFICER_TOKEN = data.get('token')

status, data = req('POST', '/auth/login', {'email': 'alice@example.com', 'password': 'wrong'})
test('Login with wrong password returns 401', status == 401)

status, data = req('POST', '/auth/login', {'email': 'alice@example.com'})
test('Login missing password returns 400', status == 400)

status, data = req('POST', '/auth/login', {})
test('Login empty body returns 400', status == 400)

print('\n=== Day 2: Customer Loan APIs ===\n')

status, data = req('GET', '/loans/my-applications', token=CUSTOMER_TOKEN)
test('Customer GET my-applications returns 200', status == 200)
test('Customer has applications', len(data) > 0)

status, data = req('POST', '/loans/apply', {'amount': 10000, 'purpose': 'Test loan', 'monthly_income': 4000}, token=CUSTOMER_TOKEN)
test('Apply loan returns 201', status == 201)
test('Applied loan has pending status', data.get('status') == 'pending')

status, data = req('POST', '/loans/apply', {'amount': 10000}, token=CUSTOMER_TOKEN)
test('Apply missing fields returns 400', status == 400)

status, data = req('POST', '/loans/apply', {'amount': -100, 'purpose': 'Test', 'monthly_income': 4000}, token=CUSTOMER_TOKEN)
test('Apply negative amount returns 400', status == 400)

status, data = req('POST', '/loans/apply', {'amount': 10000, 'purpose': 'Test', 'monthly_income': 4000})
test('Apply without token returns 401', status == 401)

status, data = req('GET', '/loans/my-applications', token=OFFICER_TOKEN)
test('Officer cannot access my-applications (403)', status == 403)

print('\n=== Day 3: Officer Loan APIs ===\n')

status, data = req('GET', '/loans/pending', token=OFFICER_TOKEN)
test('Officer GET pending returns 200', status == 200)
test('Pending list has items', len(data) > 0)
PENDING_ID = data[0]['id']

status, data = req('GET', '/loans/pending', token=CUSTOMER_TOKEN)
test('Customer cannot access pending (403)', status == 403)

status, data = req('POST', f'/loans/{PENDING_ID}/action', {'action': 'approved', 'risk_score': 85}, token=OFFICER_TOKEN)
test('Approve loan returns 200', status == 200)
test('Approved loan has approved status', data.get('status') == 'approved')
test('Approved loan has risk_score', data.get('risk_score') is not None)

status, data = req('POST', f'/loans/{PENDING_ID}/action', {'action': 'approved'}, token=OFFICER_TOKEN)
test('Double approve returns 400 (already reviewed)', status == 400)

# Create a new loan to test rejection
status, data = req('POST', '/loans/apply', {'amount': 5000, 'purpose': 'Test rejection', 'monthly_income': 2000}, token=CUSTOMER_TOKEN)
REJECT_ID = data['id']

status, data = req('POST', f'/loans/{REJECT_ID}/action', {'action': 'rejected'}, token=OFFICER_TOKEN)
test('Reject loan returns 200', status == 200)
test('Rejected loan has rejected status', data.get('status') == 'rejected')

status, data = req('POST', '/loans/9999/action', {'action': 'approved'}, token=OFFICER_TOKEN)
test('Action on non-existent loan returns 404', status == 404)

status, data = req('POST', f'/loans/{PENDING_ID}/action', {'action': 'invalid'}, token=OFFICER_TOKEN)
test('Invalid action returns 400', status == 400)

print(f'\n=== Results: {passed} passed, {failed} failed ===\n')
