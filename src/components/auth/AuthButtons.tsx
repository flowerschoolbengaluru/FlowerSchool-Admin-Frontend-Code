import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api, { endpoints } from '@/lib/api';
import { useAuth } from '@/hooks/user-auth';

export function AuthButtons({ onMenuClose }: { onMenuClose?: () => void }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Derived user display name
  const userName = user?.name || user?.email?.split('@')[0] || '';

  useEffect(() => {
    // Prefer the in-memory auth context for admin status to avoid extra
    // network calls. Fall back to localStorage for compatibility during dev.
    const determine = () => {
      try {
        if (user && (user as any).usertype === 'admin') {
          setIsAdmin(true);
          return;
        }
      } catch (e) {
        // ignore
      }

      const localIsAdmin = localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(localIsAdmin);
    };
    determine();
  }, [isAuthenticated]);

 const handleLogout = async () => {
    try {
      await api.post(endpoints.logout);
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    try {
      logout();
    } catch (e) {
      console.error('Local logout failed:', e);
    }

    toast({
      title: 'Success',
      description: "You've been logged out successfully",
    });
    navigate('/signin');
    if (onMenuClose) onMenuClose();
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2 md:gap-4">
        <span className="text-sm font-medium hidden md:inline-flex">Welcome, {userName}</span>
     {isAdmin && (
  <Button
    variant="ghost"
    size="sm"
    className="inline-flex"
    onClick={() => {
      try {
        if (onMenuClose) onMenuClose();
        navigate('/admin');
        console.log('Navigation to admin attempted'); // Debug log
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }}
  >
    Admin
  </Button>
)}
        <Button variant="outline" size="sm" onClick={handleLogout}>Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>Sign In</Button>
    </div>
  );
}