import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/user-auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { user, ready, logout } = auth as any;

      if (!ready) {
        setIsLoading(true);
        return;
      }

      const clientSaysAdmin = !!(user && (user as any).usertype === 'admin');
      const localIsAdmin = localStorage.getItem('isAdmin') === 'true';
      let legacyLocalUserIsAdmin = false;
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          legacyLocalUserIsAdmin = parsed?.usertype === 'admin';
        }
      } catch (e) {
        // ignore
      }

      if (clientSaysAdmin || localIsAdmin || legacyLocalUserIsAdmin) {
        setIsAdmin(true);
        setIsLoading(false);

        // validate in background
        try {
          const resp = await api.get('/api/auth/user');
          if (cancelled) return;
          const serverIsAdmin = resp.data?.usertype === 'admin';
          if (!serverIsAdmin) {
            localStorage.removeItem('isAdmin');
            try { logout(); } catch (e) { /* ignore */ }
            setIsAdmin(false);
          }
        } catch (err) {
          // ignore transient errors
        }

        return;
      }

      // Blocking server check when no client claim
      try {
        const resp = await api.get('/api/auth/user');
        if (cancelled) return;
        const serverIsAdmin = resp.data?.usertype === 'admin';
        setIsAdmin(!!serverIsAdmin);
        localStorage.setItem('isAdmin', serverIsAdmin ? 'true' : 'false');
        if (!serverIsAdmin) {
          localStorage.removeItem('isAdmin');
          toast({ title: 'Access Denied', description: 'You need admin privileges to access this page', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          try { logout(); } catch (e) { /* ignore */ }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    check();
    return () => { cancelled = true; };
  }, [auth.user, (auth as any).ready]);

  if (isLoading || !(auth as any).ready) {
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