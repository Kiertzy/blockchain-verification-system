import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncAuthState, logout } from '../store/slices/authSlice'; // ✅ Correct import path
import { useNavigate } from 'react-router-dom';

export const useAuthSync = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const currentLoginIdRef = useRef(localStorage.getItem('current-login-id'));

  useEffect(() => {
    // Update ref when user changes
    if (user && token) {
      currentLoginIdRef.current = localStorage.getItem('current-login-id');
    }
  }, [user, token]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Handle logout event from another tab
      if (e.key === 'logout-event') {
        console.log('Logout detected in another tab');
        dispatch(logout());
        navigate('/', { replace: true });
        window.location.reload();
        return;
      }

      // Handle new login event from another tab
      if (e.key === 'login-event') {
        const newLoginId = localStorage.getItem('current-login-id');
        const myLoginId = currentLoginIdRef.current;

        console.log('New login detected:', { newLoginId, myLoginId });

        // If login IDs don't match, another user logged in
        if (newLoginId && newLoginId !== myLoginId) {
          console.log('Different user logged in - forcing logout');
          
          // Force logout this tab
          dispatch(logout());
          
          // Show alert and redirect
          alert('Another user has logged in. You have been logged out.');
          navigate('/', { replace: true });
          window.location.reload();
        }
        return;
      }

      // Handle direct token removal
      if (e.key === 'token' && !e.newValue && token) {
        console.log('Token removed - logging out');
        dispatch(logout());
        navigate('/', { replace: true });
        window.location.reload();
        return;
      }

      // Handle direct user removal
      if (e.key === 'user' && !e.newValue && user) {
        console.log('User removed - logging out');
        dispatch(logout());
        navigate('/', { replace: true });
        window.location.reload();
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch, navigate, token, user]);

  // Verify session integrity on mount and visibility change
  useEffect(() => {
    const verifySession = () => {
      if (token && user) {
        const storedToken = localStorage.getItem('token');
        const storedLoginId = localStorage.getItem('current-login-id');
        const myLoginId = currentLoginIdRef.current;

        // If token is gone or login ID changed, logout
        if (!storedToken || (storedLoginId && storedLoginId !== myLoginId)) {
          console.log('Session mismatch detected - logging out');
          dispatch(logout());
          navigate('/', { replace: true });
          window.location.reload();
        }
      }
    };

    // Check on visibility change (when user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        verifySession();
      }
    };

    // Check on focus
    const handleFocus = () => {
      verifySession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch, navigate, token, user]);
};
