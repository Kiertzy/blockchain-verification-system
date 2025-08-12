  import { useState, useEffect, useRef } from 'react';
  import { Sun, Moon, X } from "lucide-react";
  import { useTheme } from "@/hooks/use-theme";
  import { useNavigate } from "react-router-dom";
  import { useSelector, useDispatch } from 'react-redux';
  import { loginUser, verifyOTP, clearError, resetOtpState } from '../../store/slices/authSlice';

  const Login = () => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const inputRefs = useRef([]);
    
    // Local state
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    
    // Redux state
    const { isLoading, error, otpSent, isAuthenticated, email, otpFailed, user } = useSelector(
      (state) => state.auth
    );

    useEffect(() => {
      dispatch(clearError());
    }, []);

    useEffect(() => {
      if (isAuthenticated && user) {
        if (user.role === "ADMIN") {
          navigate('/dashboard');
        } else if (user.role === "STUDENT") {
          navigate('/student-dashboard');
        } else if (user.role === "INSTITUTION") {
          navigate('/institution-dashboard');
        }
        else if (user.role === "VERIFIER") {
          navigate('/verifier/dashboard');
        }
        else {
          navigate('/'); // fallback
        }
      }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
      if (otpFailed) {
        setTimeout(() => {
          window.location.reload(); // Reload after a short delay
        }, 1000);
      }
    }, [otpFailed]);

    // Timer for OTP expiration
    useEffect(() => {
      let timer;
      if (otpSent) {
        setTimeLeft(900); // Reset to 15 minutes
        timer = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [otpSent]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.email || !formData.password) {
        return;
      }

      dispatch(loginUser(formData));
    };

    const handleOtpChange = (index, value) => {
      if (value.length > 1) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleOtpKeyDown = (index, e) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handleOtpSubmit = (e) => {
      e.preventDefault();
      
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        return;
      }

      dispatch(verifyOTP({
        email,
        otpCode
      }));
    };

    const handleCloseModal = () => {
      dispatch(resetOtpState());
      setOtp(['', '', '', '', '', '']);
      setFormData({ email: '', password: '' });
    };

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
      <>
        <div className="min-h-screen flex flex-col lg:flex-row transition-colors duration-300 bg-white dark:bg-slate-900">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition z-10"
          >
            <Sun size={20} className="dark:hidden text-slate-700" />
            <Moon size={20} className="hidden dark:block text-slate-100" />
          </button>

          {/* Login Form Section */}
          <div className="w-full lg:w-1/2 flex justify-center items-center px-6 py-12 min-h-screen">
            <div className="w-full max-w-md">
              <img
                className="mx-auto h-10 w-auto"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                alt="Tailwind Logo"
              />
              <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                Sign in to your account
              </h2>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

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
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <button  type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500" onClick={() => navigate("/forgot-password")}>
                        Forgot password?
                      </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Sign In Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>

          {/* Right Side Image - Hidden on Mobile */}
          <div className="hidden lg:block lg:w-1/2">
            <img
              src="https://media.istockphoto.com/id/1696781145/photo/modern-building-in-the-city-with-blue-sky.jpg?s=612x612&w=0&k=20&c=POfayTyDe06tGX4CeJgS8-fb896MUC46dl3ZbHXBqN4="
              alt="Institution"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* OTP Modal */}
        {otpSent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                disabled={isLoading}
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Verify Your Identity
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We've sent a 6-digit code to <strong className="text-blue-600">{email}</strong>
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleOtpSubmit}>
                {/* OTP Input */}
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center mb-4">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Code expires in: <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 font-bold">Code has expired</p>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isOtpComplete || timeLeft === 0}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              {/* Back to Login */}
              <div className="text-center mt-4">
                <button
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  export default Login;