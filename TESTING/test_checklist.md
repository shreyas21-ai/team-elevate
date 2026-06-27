# LoanFlow - Test Checklist

## Day 1 — Authentication & Setup
- [ ] Backend starts on `http://localhost:5000`
- [ ] Database seeded with sample users (customer + officer)
- [ ] Login page renders at `/login`
- [ ] Login with alice@example.com / password123 → redirects to `/customer/dashboard`
- [ ] Login with bob@example.com / password123 → redirects to `/officer/dashboard`
- [ ] Invalid credentials show error message
- [ ] Token stored in localStorage after login
- [ ] Role stored in localStorage
- [ ] Protected routes redirect to `/login` when no token
- [ ] Customer cannot access `/officer/*` routes
- [ ] Officer cannot access `/customer/*` routes

## Day 2 — Customer Flow
- [ ] Customer Dashboard shows stats cards (total, pending, approved, rejected)
- [ ] Customer Dashboard lists my applications in a table
- [ ] "Apply for Loan" button navigates to `/customer/apply`
- [ ] Loan form has fields: amount, purpose, monthly income
- [ ] Form validation: empty fields show error
- [ ] Form validation: negative/zero amounts show error
- [ ] Form validation: non-numeric values rejected
- [ ] Successful submission shows toast and redirects to history
- [ ] My Applications page lists all applications with status badges
- [ ] Profile page shows user info (name, email, role)
- [ ] Filter: customer sees only their own applications
- [ ] API: POST /api/v1/auth/login returns token + role
- [ ] API: POST /api/v1/loans/apply creates pending loan
- [ ] API: GET /api/v1/loans/my-applications returns customer's loans

## Day 3 — Officer Flow
- [ ] Officer Dashboard shows pending count stat
- [ ] Officer Dashboard shows PieChart with status distribution
- [ ] Officer Dashboard lists recent pending applications
- [ ] "View All Pending" navigates to `/officer/applications`
- [ ] Pending Applications page shows all pending loans
- [ ] "Review" button navigates to `/officer/review/:id`
- [ ] Review page shows loan details (amount, income, purpose, risk score)
- [ ] Approve button changes status to `approved`
- [ ] Reject button changes status to `rejected`
- [ ] Toast notification on approve/reject
- [ ] After action, redirects back to pending list
- [ ] Already-reviewed application shows "already reviewed" error
- [ ] API: GET /api/v1/loans/pending returns pending loans (officer only)
- [ ] API: POST /api/v1/loans/<id>/action updates status
- [ ] Audit log created on approve/reject

## Day 4 — Integration & Polish
- [ ] Full flow: login → apply → officer review → customer sees status
- [ ] Loading skeletons show while data fetches
- [ ] Error states display when API fails
- [ ] Toasts show for success and error actions
- [ ] Responsive: layout works on mobile (sidebar collapses)
- [ ] Tables are scrollable on small screens
- [ ] All pages have consistent styling
- [ ] Customer cannot access officer APIs (403)
- [ ] Officer cannot access customer APIs (403)
- [ ] Expired token returns 401
- [ ] CORS enabled for frontend origin
