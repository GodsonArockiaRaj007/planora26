import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import CompanyDetail from './components/CompanyDetail';
import Profile from './components/Profile';
import MessagePage from './pages/MessagePage';
import PostOrder from './pages/PostOrder';

// PrivateRoute component to protect routes
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/company/:id"
            element={
              <PrivateRoute>
                <CompanyDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/post-order"
            element={
              <PrivateRoute>
                <PostOrder />
              </PrivateRoute>
            }
          />

          {/* Catch-all route: Redirect unknown routes to Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
