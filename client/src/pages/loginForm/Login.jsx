import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Login = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-white px-4 dark:bg-slate-900 transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
      >
        <Sun size={20} className="dark:hidden text-slate-700" />
        <Moon size={20} className="hidden dark:block text-slate-100" />
      </button>

      <div className="w-full max-w-md">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Tailwind Logo"
        />
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 w-full max-w-md">
        <form className="space-y-6" action="#" method="POST">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-600 focus:border-violet-600 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Doesn't have an account?{" "}
          <a
            href="#"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
