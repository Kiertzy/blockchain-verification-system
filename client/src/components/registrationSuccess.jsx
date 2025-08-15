// src/pages/RegistrationSuccess.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, CheckCircle2 } from "lucide-react";

export default function RegistrationSuccess() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();


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
          <CheckCircle2 size={48} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Registration Successful!
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
          Welcome{" "} your account has been successfully created.
          <br/>  
          Account is currently under review.  
          You’ll receive an update once an administrator approves your account.
        </p>

        <div className="mt-6 flex flex-col items-center space-y-1">
          <span className="text-sm text-green-600 dark:text-green-400">
            Status
          </span>
          <span className="text-sm text-yellow-600 dark:text-yellow-400">
            PENDING
          </span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Go to Login
        </button>

      </div>
    </div>
  );
}
