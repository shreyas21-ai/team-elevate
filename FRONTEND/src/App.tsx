import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './app/(auth)/login/Login';
import { CustomerDashboard } from './app/(dashboard)/customer/Dashboard';
import { CustomerApply } from './app/(dashboard)/customer/Apply';
import { CustomerHistory } from './app/(dashboard)/customer/History';
import { CustomerProfile } from './app/(dashboard)/customer/Profile';
import { OfficerDashboard } from './app/(dashboard)/officer/Dashboard';
import { OfficerApplications } from './app/(dashboard)/officer/Applications';
import { OfficerReview } from './app/(dashboard)/officer/Review';
import { OfficerProfile } from './app/(dashboard)/officer/Profile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/apply" element={<CustomerApply />} />
                <Route path="/customer/history" element={<CustomerHistory />} />
                <Route path="/customer/profile" element={<CustomerProfile />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
                <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                <Route path="/officer/applications" element={<OfficerApplications />} />
                <Route path="/officer/review/:id" element={<OfficerReview />} />
                <Route path="/officer/profile" element={<OfficerProfile />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
