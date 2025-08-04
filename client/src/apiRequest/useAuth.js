import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    ...auth,
    logout: logoutUser,
  };
};

export default useAuth;