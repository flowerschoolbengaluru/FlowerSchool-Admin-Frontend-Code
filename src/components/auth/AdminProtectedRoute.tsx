import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SESSION_STORAGE_KEY } from '@/lib/auth';
import { useAuth } from '@/hooks/user-auth';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      // Prefer the centralized auth context instead of ad-hoc localStorage keys.
      const { user, isAuthenticated, logout, ready } = auth as any;

      // Dev debug: print auth state when this route mounts
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        try {
          // eslint-disable-next-line no-console
          console.debug('[AdminProtectedRoute] auth ready=', ready, 'isAuthenticated=', isAuthenticated, 'user=', user);
        } catch (e) {}
      }

      // Wait until auth provider has finished initializing (it may try
      // to recover state from the server when cookies are HTTP-only).
      if (!ready) {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
          try { console.debug('[AdminProtectedRoute] waiting for auth.ready'); } catch (e) {}
        }
        return;
      }

      // First, allow immediate access when the client already believes user is admin
      // This prevents a jarring redirect when the app uses HTTP-only cookies
      // and the AuthProvider or server-side validation is still resolving.
      try {
        const clientUser = (auth as any).user;
        const clientSaysAdmin = clientUser && clientUser.usertype === 'admin';
        const localIsAdmin = localStorage.getItem('isAdmin') === 'true';
        // Also accept the legacy `localStorage.user` object which some
        // sign-in flows set with the full user payload (includes usertype).
        let legacyLocalUserIsAdmin = false;
        try {
          const raw = localStorage.getItem('user');
          if (raw) {
            const parsed = JSON.parse(raw);
            legacyLocalUserIsAdmin = parsed?.usertype === 'admin';
          }
        } catch (e) {
          // ignore parse errors
        }

  if (clientSaysAdmin || localIsAdmin || legacyLocalUserIsAdmin) {
          if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
            try { console.debug('[AdminProtectedRoute] allowing admin from client claim', { clientSaysAdmin, localIsAdmin }); } catch (e) {}
          }
          setIsAdmin(true);
          // Still kick off a background validation to keep the client in sync
          (async () => {
            try {
              const resp = await api.get('/api/auth/user');
              const isAdminResp = resp.data?.usertype === 'admin';
              if (!isAdminResp) {
                // server disagrees — remove client claim and trigger logout
                localStorage.removeItem('isAdmin');
                try { auth.logout(); } catch (e) { /* ignore */ }
              }
            } catch (err) {
              // network error — leave client state as-is for now
              if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
                try { console.debug('[AdminProtectedRoute] background admin validation failed', err); } catch (e) {}
              }
            }
          })();
          setIsLoading(false);
          return;
        }

        // Otherwise fall back to a blocking server-side check
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
          try { console.debug('[AdminProtectedRoute] performing blocking server validation'); } catch (e) {}
        }

        const response = await api.get('/api/auth/user');
        const isAdminResp = response.data?.usertype === 'admin';
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
          try { console.debug('[AdminProtectedRoute] /api/auth/user response status=', response.status, 'usertype=', response.data?.usertype); } catch (e) {}
        }
        setIsAdmin(isAdminResp);
        localStorage.setItem('isAdmin', isAdminResp ? 'true' : 'false');

        if (!isAdminResp) {
          localStorage.removeItem('isAdmin');
          toast({
            title: 'Access Denied',
            description: 'You need admin privileges to access this page',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
        // Don't immediately logout on transient network errors — only on 401/403
        if (error.response?.status === 401 || error.response?.status === 403) {
          try { auth.logout(); } catch (e) { /* ignore */ }
        }
      } finally {
        setIsLoading(false);
      }

      // (no-op) finished
    };

    checkAuth();
    // Re-run this check whenever auth state changes (handles race between
    // AuthProvider initialization and route mount)
  }, [auth.isAuthenticated, auth.user, (auth as any).ready]);

  if (!auth.ready || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}