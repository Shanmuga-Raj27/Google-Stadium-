import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const FanDashboard = lazy(() => import('./pages/FanDashboard'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const VendorWallet = lazy(() => import('./pages/VendorWallet'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminGates = lazy(() => import('./pages/AdminGates'));
const AdminMapEditor = lazy(() => import('./pages/AdminMapEditor'));
const StadiumMapPage = lazy(() => import('./pages/StadiumMapPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import { ThemeProvider } from './store/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
      <Router>
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-black text-googleBlue text-xl animate-pulse">Loading Stadium...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />
            
            <Route element={<SidebarLayout />}>
              <Route path="/fan-dashboard" element={
                <ProtectedRoute allowedRoles={['fan', 'admin']}>
                  <FanDashboard />
                </ProtectedRoute>
              } />
              <Route path="/vendor-dashboard" element={
                <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/vendor/wallet" element={
                <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                  <VendorWallet />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/gates" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminGates />
                </ProtectedRoute>
              } />
              <Route path="/admin/map-editor" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMapEditor />
                </ProtectedRoute>
              } />
              <Route path="/map" element={
                <ProtectedRoute allowedRoles={['fan', 'vendor', 'admin']}>
                  <StadiumMapPage />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
