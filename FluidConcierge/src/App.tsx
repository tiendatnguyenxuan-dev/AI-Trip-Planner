import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import PlanTrip from './pages/PlanTrip';
import Explore from './pages/Explore';
import Itinerary from './pages/Itinerary';
import Places from './pages/admin/Places';
import Users from './pages/admin/Users';
import Community from './pages/admin/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivitySelection from './pages/ActivitySelection';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './hooks/useWebSocket.tsx';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route index element={<Explore />} />
                <Route path="/my-trips" element={<Dashboard />} />
                <Route path="/plan" element={<PlanTrip />} />
                <Route path="/explore" element={<Navigate to="/" replace />} />
                <Route path="/selection/:id" element={<ActivitySelection />} />
                <Route path="/itinerary/:id" element={<Itinerary />} />
              </Route>
            </Route>

            {/* Protected Admin Routes (Tạm thời tắt adminOnly để test UI) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="places" replace />} />
                <Route path="places" element={<Places />} />
                <Route path="users" element={<Users />} />
                <Route path="community" element={<Community />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
