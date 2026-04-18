import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FanDashboard from './pages/FanDashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorWallet from './pages/VendorWallet';
import AdminDashboard from './pages/AdminDashboard';
import AdminGates from './pages/AdminGates';
import AdminMapEditor from './pages/AdminMapEditor';
import StadiumMapPage from './pages/StadiumMapPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import { ThemeProvider } from './store/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
