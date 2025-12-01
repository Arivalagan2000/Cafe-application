import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from 'sonner@2.0.3';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import OrderMenu from './pages/OrderMenu';
import Orders from './pages/Orders';
import { useEffect, useState } from 'react';
import { initSampleData } from './utils/api';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/menu" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAdmin } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize sample data and demo users on first load
    if (!initialized) {
      Promise.all([
        import('./utils/setup').then(m => m.setupDemoUsers()),
        initSampleData()
      ])
        .then(() => console.log('Initialization complete'))
        .catch(err => console.error('Initialization error:', err))
        .finally(() => setInitialized(true));
    }
  }, [initialized]);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/menu'} replace /> : <Login />}
      />
      
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/menu-management"
        element={
          <PrivateRoute adminOnly>
            <MenuManagement />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/menu"
        element={
          <PrivateRoute>
            <OrderMenu />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/"
        element={<Navigate to={user ? (isAdmin ? '/admin' : '/menu') : '/login'} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
