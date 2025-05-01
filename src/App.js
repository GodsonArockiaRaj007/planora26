import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';

// Lazy load route components
const Home = lazy(() => import('./components/Home'));
const CompanyDetail = lazy(() => import('./components/CompanyDetail'));
const Profile = lazy(() => import('./components/Profile'));
const MessagePage = lazy(() => import('./pages/MessagePage'));
const PostOrder = lazy(() => import('./pages/PostOrder'));

// PrivateRoute component
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" replace />;
}

// AppRoutes separated to allow access to AuthContext
function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        {!currentUser && <Route path="/" element={<Login />} />}
        {!currentUser && <Route path="/signup" element={<Signup />} />}

        {/* Redirect to /home if already logged in and trying to access / or /signup */}
        {currentUser && <Route path="/" element={<Navigate to="/home" replace />} />}
        {currentUser && <Route path="/signup" element={<Navigate to="/home" replace />} />}

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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={currentUser ? "/home" : "/"} replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/planora26">
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
