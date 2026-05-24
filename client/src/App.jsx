import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

// Let's import the AuthProvider from Context. Let's make sure our context file exports the provider correctly.
// In AuthContext.jsx, we exported: export const AuthProvider = ({ children }) => { ... }
// So we can import it as { AuthProvider } from './context/AuthContext';
import { AuthProvider as ContextProvider } from './context/AuthContext';

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          {/* 1. Public Authentication Routes (Wrapped in AuthLayout) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* 2. Secured Dashboard Routes (Wrapped in DashboardLayout) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 3. Global Redirect Rules */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      {/* Modern React Hot Toast Notifications wrapper */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          }
        }}
      />
    </ContextProvider>
  );
}

export default App;
