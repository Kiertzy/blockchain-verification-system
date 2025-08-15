import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { useTheme } from "@/hooks/use-theme";
import { LogOut, Clock, Sun, Moon } from "lucide-react";
import { useEffect } from "react";

export default function PendingDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Multi-tab logout sync
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === "logout") {
        dispatch(logout());
        navigate("/");
      }
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, [dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 px-4">
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Card */}
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center border border-slate-200 dark:border-slate-700">
        <div className="flex justify-center mb-4">
          <Clock size={48} className="text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Account Pending Approval
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
          Hello <span className="font-semibold">{user?.firstName} {user?.lastName}</span>,  
          your account is currently under review.  
          You’ll receive an update once an administrator approves your account.
        </p>

        <div className="mt-6 flex flex-col items-center space-y-1">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Role: {user?.role}
          </span>
          <span className="text-sm text-yellow-600 dark:text-yellow-400">
            Status: {user?.accountStatus}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
