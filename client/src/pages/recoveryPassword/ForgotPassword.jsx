import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { sendRecoveryOtp, verifyRecoveryOtp, resetPassword, clearAuthRecoveryState } from "../../store/slices/authRecoverySlice";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";

const ForgotPassword = () => {
    const { theme, setTheme } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, message } = useSelector((state) => state.authRecovery);

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        dispatch(clearAuthRecoveryState());
    }, [dispatch]);

    /* Step 1: Send OTP */
    const handleSendOtp = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        dispatch(sendRecoveryOtp(email)).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                setStep(2);
            }
        });
    };

    /* Step 2: Verify OTP */
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (!otpCode.trim()) return;

        dispatch(verifyRecoveryOtp({ otpCode, email })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                setStep(3);
            } else if (res.meta.requestStatus === "rejected") {
                // OTP incorrect: show brief delay before redirect
                setTimeout(() => {
                    navigate("/login");
                    window.location.reload();
                }, 1500);
            }
        });
    };

    /* Step 3: Reset Password */
    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!otpCode.trim() || !password.trim()) return;
        dispatch(resetPassword({ otpCode, email, password })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                navigate("/login");
            }
        });
    };

    // Add timer state at top
    const [timer, setTimer] = useState(900); // 15 minutes in seconds

    // Countdown effect
    useEffect(() => {
      if (step === 2 && timer > 0) {
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
      }
    }, [step, timer]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-slate-900">
            {/* Dark Mode Toggle */}
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
            >
                <Sun
                    size={20}
                    className="text-slate-700 dark:hidden"
                />
                <Moon
                    size={20}
                    className="hidden text-slate-100 dark:block"
                />
            </button>

            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
                <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Verify OTP"}
                    {step === 3 && "Reset Password"}
                </h2>

                <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-300">
                    {step === 1 && "Enter your registered email address. We will send you an OTP to reset your password."}
                    {step === 2 && "Enter the OTP sent to your email to verify your identity."}
                    {step === 3 && "Enter your new password to complete the reset."}
                </p>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Success */}
                {message && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-700 dark:bg-green-900/50 dark:text-green-300">
                        {message}
                    </div>
                )}

                {/* Step 1: Email */}
                {step === 1 && (
                    <form
                        onSubmit={handleSendOtp}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form
                        onSubmit={handleVerifyOtp}
                        className="space-y-6"
                    >
                        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                            We&apos;ve sent a 6-digit code to <span className="font-medium text-blue-500">{email}</span>
                        </div>

                        {/* OTP Boxes */}
                        <div className="flex justify-center gap-2">
                            {[...Array(6)].map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={otpCode[index] || ""}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                                        if (!val && index > 0) {
                                            // move focus to previous box if deleting
                                            e.target.previousSibling?.focus();
                                        }
                                        const newOtp = otpCode.split("");
                                        newOtp[index] = val;
                                        setOtpCode(newOtp.join(""));
                                        if (val && e.target.nextSibling) {
                                            e.target.nextSibling.focus();
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                />
                            ))}
                        </div>

                        {/* Countdown */}
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Code expires in:{" "}
                            <span className="font-medium text-blue-500">
                                {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otpCode.length !== 6}
                            className="w-full rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 3 && (
                    <form
                        onSubmit={handleResetPassword}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
