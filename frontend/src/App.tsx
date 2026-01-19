import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layouts/main-layout';
import { HomePage } from '@/pages/home';
import { LoginPage, RegisterPage } from '@/pages/auth/login';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isMembershipActive } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isMembershipActive) {
    return <Navigate to="/membership" replace />;
  }

  return <>{children}</>;
}

// Public route wrapper (redirect if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Placeholder pages
function MarketplacePage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold">Marketplace</h1>
      <p className="text-muted-foreground mt-2">Página en construcción</p>
    </div>
  );
}

function ServicesPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold">Directorio de Servicios</h1>
      <p className="text-muted-foreground mt-2">Página en construcción</p>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      <p className="text-muted-foreground mt-2">Página en construcción</p>
    </div>
  );
}

function MembershipPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Membresía Requerida</h1>
        <p className="text-muted-foreground mt-2">
          Tu membresía ha expirado o está pendiente de activación.
          Contacta al administrador para renovar tu suscripción.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/membership" element={<MembershipPage />} />

          {/* Protected routes with MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
