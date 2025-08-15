import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { useTheme } from "@/hooks/use-theme";
import { ClipboardCopy, Check, Bell, ChevronsLeft, Moon, Sun, LogOut } from "lucide-react";
import PropTypes from "prop-types";

export const Header = ({ collapsed, setCollapsed }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();
    const { user } = useSelector((state) => state.auth);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const syncLogout = (event) => {
            if (event.key === 'logout') {
                dispatch(logout());
                navigate('/');
            }
        };
        window.addEventListener('storage', syncLogout);
        return () => window.removeEventListener('storage', syncLogout);
    }, [dispatch, navigate]);
    
    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const getInitials = (firstName = "", lastName = "") => {
        const first = firstName.charAt(0) || "";
        const last = lastName.charAt(0) || "";
        return `${first}${last}`;
    };

    const formatWalletAddress = (address) => {
        if (!address) return "Wallet Address";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-sm transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>
            </div>

            <div
                className="relative flex items-center gap-x-3"
                ref={menuRef}
            >
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block"
                    />
                </button>

                <button className="btn-ghost size-10">
                    <Bell size={20} />
                </button>

                {/* Profile avatar */}
                <button
                    className="size-10 overflow-hidden rounded-full border-2 border-slate-300 dark:border-slate-700"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span className="flex h-full w-full items-center justify-center bg-slate-300 text-sm font-semibold uppercase text-slate-800 dark:bg-slate-600 dark:text-white">
                        {getInitials(user?.firstName, user?.lastName)}
                    </span>
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                    <div className="absolute right-0 top-[65px] w-56 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 transition-all dark:bg-slate-800 dark:ring-slate-700">
                        <div className="border-b px-4 py-3 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {user ? `${user.firstName} ${user.lastName}` : "User Name"}
                            </p>
                            <p className="text-sm font-medium text-blue-600 dark:!text-blue-600">
                                {user ? formatWalletAddress(user.walletAddress) : "Wallet Address"}<span>  </span>
                                {user?.walletAddress && (
                                <button
                                    onClick={() => handleCopy(user.walletAddress)}
                                    className="text-slate-400 transition hover:text-slate-600 dark:text-slate-600 dark:hover:text-white"
                                    title="Copy address"
                                >
                                    {copied ? (
                                        <Check
                                            size={13}
                                            className="text-green-500"
                                        />
                                    ) : (
                                        <ClipboardCopy size={13} />
                                    )}
                                </button>
                            )}
                            </p>
                            <p className="text-sm font-small text-slate-900 dark:text-slate-500">
                                {user.role}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
