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
  // Start `ready` as false and only mark true after we've completed
  // the server-side validation. This prevents consumers (like Admin)
  // from acting on a premature `ready` value before the provider has
  // synchronized with the backend session state.
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getInitialUser());
  const [ready, setReady] = useState(false);
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
      // We already had a user (from canonical storage or legacy localStorage).
      // Perform a background validation to sync with the server, and only
      // mark the provider `ready` once that validation finishes. This
      // prevents routes/components from assuming the initial local value
      // is the canonical truth and redirecting prematurely.
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
        } finally {
          setReady(true);
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

    // Check auth state on focus/visibility change. Instead of trusting
    // client-side storage (which may be empty for HTTP-only cookie sessions),
    // perform a short server validation when the page becomes visible. This
    // avoids transient sign-out flashes when another tab updates storage or
    // when cookies are used and localStorage is empty.
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const resp = await api.get('/api/auth/user');
          if (resp && resp.data) {
            setUser(resp.data as UserData);
            setIsAuthenticated(true);
          } else {
            // If server doesn't return a user, keep the existing client user
            // until we have stronger evidence to clear it. This prevents a
            // flash-to-signin when the server is temporarily unreachable.
          }
        } catch (e) {
          // Network error or 401 — do not immediately wipe local UI state.
          // Let other mechanisms (auth:logout event or explicit server
          // validation during mount) handle full sign-out to avoid UX jank.
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-update', handleAuthUpdate as EventListener);
    // Respond to auth:logout dispatched by low-level API code when a 401 is
    // encountered. The app-level provider can then clear state and navigate.
    const handleAuthLogout = (ev: Event) => {
      try {
        // Clear local session state
        logout();
      } catch (e) {
        // ignore
      }
      try {
        // Perform an in-app navigation to the sign-in page. Use location.href
        // to ensure navigation works even if this provider is used outside a
        // router context during tests or edge cases.
        window.location.href = '/signin';
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('auth:logout', handleAuthLogout as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-update', handleAuthUpdate as EventListener);
      window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
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
 