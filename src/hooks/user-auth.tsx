import { createContext, useContext, useEffect, useState } from 'react';
import { UserData, authStorage, SESSION_STORAGE_KEY } from '@/lib/auth';
import api from '@/lib/api';

interface AuthContextType {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
  isAuthenticated: boolean;
  ready: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Try canonical storage first (authStorage). If that yields nothing, fall
  // back to the legacy `localStorage.user` payload so a page refresh keeps
  // UI state stable for older sign-in flows that wrote the full user object.
  const getInitialUser = (): UserData | null => {
    const canonical = authStorage.getUser();
    if (canonical) return canonical;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Map legacy shape into UserData expected shape. token may be absent.
        return {
          id: parsed.id || parsed.userId || '',
          email: parsed.email || parsed.emailAddress || '',
          name: parsed.firstname || parsed.name || parsed.email?.split('@')[0] || '',
          token: parsed.token || '',
          usertype: parsed.usertype
        } as UserData;
      }
    } catch (e) {
      // ignore parse errors
    }
    return null;
  };

  const [user, setUser] = useState<UserData | null>(() => getInitialUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getInitialUser());
  const [ready, setReady] = useState(() => !!getInitialUser());
  const [isAdmin, setIsAdmin] = useState(() => {
    const initialUser = getInitialUser();
    if (initialUser?.usertype === 'admin') return true;
    return localStorage.getItem('isAdmin') === 'true';
  });

  const login = (userData: UserData) => {
    authStorage.saveUser(userData);
    // Persist a legacy copy for older code paths that read `localStorage.user`
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.usertype === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
      }
    } catch (e) {
      // ignore
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authStorage.clearUser();
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
    } catch (e) {
      /* ignore */
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    // Initial auth check: if we already set `ready=true` because the
    // initial state came from legacy localStorage, still validate with the
    // server but in the background so UI doesn't flash to SignIn on reload.
    const currentUser = authStorage.getUser();
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      try {
        // eslint-disable-next-line no-console
        console.debug('[AuthProvider] initial user:', currentUser || user);
      } catch (e) {
        // ignore
      }
    }

    if (!currentUser && !user) {
      // If we couldn't recover a user from client-side canonical storage,
      // try to fetch the current user from the backend. This lets the UI
      // initialize correctly even when the client cannot read the
      // auth cookie directly.
      (async () => {
        try {
          const resp = await api.get('/api/auth/user');
          const serverUser = resp.data;
          if (serverUser) {
            // Persist a lightweight session record so other parts of the
            // app that read session/local storage can still function.
            try {
              const stored = {
                id: serverUser.id,
                email: serverUser.email,
                name: serverUser.firstname || serverUser.name || serverUser.email?.split('@')[0] || '',
                lastUpdated: new Date().toISOString(),
                sessionId: ''
              };
              sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
            } catch (e) {
              // ignore storage errors
            }

            setUser(serverUser as UserData);
            setIsAuthenticated(true);
          }
        } catch (e) {
          // No server session or network error — keep user null
        } finally {
          setReady(true);
        }
      })();
    } else {
      // We already had a user (from canonical storage or legacy localStorage)
      // so mark provider ready and perform a background validation to sync
      // with the server without blocking the UI.
      setReady(true);
      (async () => {
        try {
          const resp = await api.get('/api/auth/user');
          const serverUser = resp.data;
          if (serverUser) {
            setUser(serverUser as UserData);
            setIsAuthenticated(true);
          }
        } catch (e) {
          // ignore transient errors
        }
      })();
    }

    // Handle storage events for cross-tab synchronization
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY) {
        const currentUser = authStorage.getUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      }
    };

    const handleAuthUpdate = (event: CustomEvent) => {
      const currentUser = authStorage.getUser();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    };

    // Check auth state on focus/visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentUser = authStorage.getUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-update', handleAuthUpdate as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-update', handleAuthUpdate as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, ready, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
 