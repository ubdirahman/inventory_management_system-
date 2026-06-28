import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import UserDashboard from './pages/User/Dashboard';
import Customer from './pages/User/Customer';
import Product from './pages/User/Product';
import Sales from './pages/User/Sales';
import Debt from './pages/User/Debt';
import Reports from './pages/User/Reports';
import Settings from './pages/User/Settings';
import AdminUsers from './pages/Admin/Users';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />

        {/* User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute role="user"><Customer /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute role="user"><Product /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute role="user"><Sales /></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute role="user"><Debt /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute role="user"><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute role="user"><Settings /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
