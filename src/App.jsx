import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

import ProtectedRoute, { GuestRoute } from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Kanban from './components/Kanban';


import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import PMDashboard from './pages/project_manager/PMDashboard';
import TeamDashboard from './pages/TeamDashboard';


import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
          <Layout>
            <Routes>
              {/* Auth Routes (Guest Only) */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/forgot" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

              {/* Role-Based Redirector */}
              <Route path="/" element={<Home />} />

              {/* Protected Routes */}
              <Route path="/team" element={<ProtectedRoute roles={["member"]}><TeamDashboard /></ProtectedRoute>} />
              <Route path="/kanban" element={<ProtectedRoute roles={["member", "admin", "pm"]}><Kanban /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute roles={["admin"]}><AnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/pm" element={<ProtectedRoute roles={["pm"]}><PMDashboard /></ProtectedRoute>} />

            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
