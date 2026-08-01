import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserLayout from './components/layout/UserLayout.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PlanTrip from './pages/PlanTrip.tsx';
import Explore from './pages/Explore.tsx';
import Itinerary from './pages/Itinerary.tsx';
import Places from './pages/admin/Places.tsx';
import Users from './pages/admin/Users.tsx';
import Community from './pages/admin/Community.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ActivitySelection from './pages/ActivitySelection.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { WebSocketProvider } from './hooks/useWebSocket.tsx';

// Phase 6 Community Feed Component
import { CommunityFeed } from './features/community/components/CommunityFeed.tsx';
import { UserProfileView } from './features/profile/components/UserProfileView.tsx';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Routes>
            {/* Redirect login/register to homepage */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />

            {/* Public User Routes */}
            <Route element={<UserLayout />}>
              <Route index element={<Explore />} />
              <Route path="/my-trips" element={<Dashboard />} />
              <Route path="/plan" element={<PlanTrip />} />
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/profile" element={<UserProfileView />} />
              <Route path="/explore" element={<Navigate to="/" replace />} />
              <Route path="/selection/:id" element={<ActivitySelection />} />
              <Route path="/itinerary/:id" element={<Itinerary />} />
            </Route>

            {/* Protected Admin Routes */}
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
