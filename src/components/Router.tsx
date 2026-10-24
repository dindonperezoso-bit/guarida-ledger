import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import { useEffect, useRef } from 'react';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import HomePage from '@/components/pages/HomePage';
import ReservaPage from '@/components/pages/ReservaPage';
import MiembrosPage from '@/components/pages/MiembrosPage';
import AdminPage from '@/components/pages/AdminPage';
import ProfilePage from '@/components/pages/ProfilePage';
import TransferenciasPage from '@/components/pages/TransferenciasPage';
import LoginPage from '@/components/pages/LoginPage';
import DiagnosticsPage from '@/components/pages/DiagnosticsPage';
import { ensureSystemInitialized } from '@/lib/data-initialization';
import { initializeCredentials } from '@/lib/initialize-credentials';
import { useAuthStore } from '@/lib/auth-store';

// Layout component that includes ScrollToTop and system initialization
function Layout() {
  const { loadAuthUser } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once to prevent race conditions
    if (initRef.current) {
      return;
    }
    initRef.current = true;

    // Initialize system and credentials in parallel (non-blocking)
    Promise.all([
      ensureSystemInitialized(),
      initializeCredentials()
    ]).catch(err => console.error('Failed to initialize system:', err));
    
    // Load auth user from storage
    loadAuthUser();
  }, [loadAuthUser]);

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
        routeMetadata: {
          pageIdentifier: 'login',
        },
      },
      {
        path: "diagnostics",
        element: <DiagnosticsPage />,
        routeMetadata: {
          pageIdentifier: 'diagnostics',
        },
      },
      {
        index: true,
        element: <HomePage />,
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "reserva",
        element: <ReservaPage />,
        routeMetadata: {
          pageIdentifier: 'reserva',
        },
      },
      {
        path: "miembros",
        element: <MiembrosPage />,
        routeMetadata: {
          pageIdentifier: 'miembros',
        },
      },
      {
        path: "admin",
        element: <AdminPage />,
        routeMetadata: {
          pageIdentifier: 'admin',
        },
      },
      {
        path: "profile",
        element: (
          <MemberProtectedRoute>
            <ProfilePage />
          </MemberProtectedRoute>
        ),
        routeMetadata: {
          pageIdentifier: 'profile',
        },
      },
      {
        path: "transferencias",
        element: (
          <MemberProtectedRoute messageToSignIn="Inicia sesión para realizar transferencias">
            <TransferenciasPage />
          </MemberProtectedRoute>
        ),
        routeMetadata: {
          pageIdentifier: 'transferencias',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
