import { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, verifyOTP, clearError, resetOtpState } from '../../store/slices/authSlice';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import LoginLogo from "../../assets/logoLogin.png";
import BlockchainAnimation from "../../assets/Image 4.gif";
import Blockchain from "../../assets/Image2.gif";
import Education from "../../assets/image3.gif";
import LinkChain from "../../assets/image1.gif";

const Login = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRefs = useRef([]);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(900);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);

  const { isLoading, error, otpSent, isAuthenticated, email, otpFailed, user } = useSelector(
    (state) => state.auth
  );

  // 🎬 GIF backgrounds array
  const gifBackgrounds = [BlockchainAnimation, Blockchain, Education, LinkChain];

  // 🌀 tsparticles initialization
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // 🔄 Rotate GIFs every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGifIndex((prevIndex) => (prevIndex + 1) % gifBackgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [gifBackgrounds.length]);

  // ✅ Clear error on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ✅ Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.accountStatus === "PENDING") {
        navigate('/pending-dashboard');
        return;
      }

      switch (user.role) {
        case "ADMIN":
          navigate('/dashboard');
          break;
        case "STUDENT":
          navigate('/student-dashboard');
          break;
        case "INSTITUTION":
          navigate('/institution-dashboard');
          break;
        case "VERIFIER":
          navigate('/verifier/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  // ✅ Reload if OTP verification fails
  useEffect(() => {
    if (otpFailed) {
      setTimeout(() => window.location.reload(), 1000);
    }
  }, [otpFailed]);

  // ✅ Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (otpSent) {
      setTimeLeft(900);
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
    return () => timer && clearInterval(timer);
  }, [otpSent]);

  // ✅ Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    dispatch(loginUser(formData));
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    dispatch(verifyOTP({ email, otpCode }));
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
      <div className="min-h-screen flex flex-col lg:flex-row transition-colors duration-300 bg-white dark:bg-slate-900 relative">

        {/* 🌗 Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition z-20"
        >
          <Sun size={20} className="dark:hidden text-slate-700" />
          <Moon size={20} className="hidden dark:block text-slate-100" />
        </button>

        {/* 🧾 Login Form Section with Particles Background */}
        <div className="relative w-full lg:w-1/2 flex justify-center items-center px-6 py-12 min-h-screen overflow-hidden">
          {/* 🌌 Particles Background */}
          <Particles
            id="tsparticles"
            init={particlesInit}
            className="absolute inset-0 z-0"
            options={{
              background: { color: { value: theme === "dark" ? "#0f172a" : "#ffffff" } },
              fpsLimit: 60,
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "repulse" },
                  resize: true,
                },
                modes: {
                  repulse: { distance: 100, duration: 0.4 },
                },
              },
              particles: {
                color: { value: theme === "dark" ? "#60a5fa" : "#1e3a8a" },
                links: {
                  color: theme === "dark" ? "#60a5fa" : "#1e3a8a",
                  distance: 120,
                  enable: true,
                  opacity: 0.3,
                  width: 1,
                },
                move: {
                  enable: true,
                  speed: 2,
                  direction: "none",
                  outModes: { default: "bounce" },
                },
                number: { value: 60, density: { enable: true, area: 800 } },
                opacity: { value: 0.5 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 4 } },
              },
              detectRetina: true,
            }}
          />

          {/* 🧩 Login Form */}
          <div className="relative z-10 w-full max-w-md text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <img
                src={LoginLogo}
                alt="Blockchain Certificate Verification System Logo"
                className="w-28 sm:w-32 md:w-36 lg:w-40 h-auto object-contain transition-all duration-300 dark:invert"
              />
            </div>

            <h5 className="text-1xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to your account
            </h5>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="text-left">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             placeholder-gray-400 focus:outline-none focus:ring-blue-600 
                             focus:border-blue-600 sm:text-sm dark:bg-slate-800 
                             dark:border-slate-600 dark:text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="text-left">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    onClick={() => navigate("/forgot-password")}
                  >
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             placeholder-gray-400 focus:outline-none focus:ring-blue-600 
                             focus:border-blue-600 sm:text-sm dark:bg-slate-800 
                             dark:border-slate-600 dark:text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent 
                           rounded-md text-sm font-medium text-white bg-blue-600 
                           hover:bg-blue-700 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

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

        {/* 🎬 Right Side - Animated GIF Background */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* GIF Container with Fade Transition */}
          <div className="absolute inset-0 flex items-center justify-center">
            {gifBackgrounds.map((gif, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
                  index === currentGifIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={gif}
                  alt={`Blockchain Animation ${index + 1}`}
                  className="max-w-[80%] max-h-[80%] w-auto h-auto object-contain rounded-3xl shadow-2xl"
                  style={{ mixBlendMode: 'normal' }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {gifBackgrounds.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentGifIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentGifIndex 
                    ? 'bg-blue-500 w-8' 
                    : 'bg-white/50 hover:bg-white/80 w-2'
                }`}
                aria-label={`Show image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🔐 OTP Modal */}
      {otpSent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              disabled={isLoading}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Verify Your Identity
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We've sent a 6-digit code to <strong className="text-blue-600">{email}</strong>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleOtpSubmit}>
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

              <div className="text-center mb-4">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Code expires in:{" "}
                    <span className="font-bold text-blue-600">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-bold">
                    Code has expired
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isOtpComplete || timeLeft === 0}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

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

