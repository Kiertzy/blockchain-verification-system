import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCertificates } from "../../../store/slices/certViewSlice";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { certificates, loading, error } = useSelector((state) => state.allCertificates);

    useEffect(() => {
        dispatch(fetchAllCertificates());
    }, [dispatch]);

    // Filter only certificates belonging to this user
    const userCertificates = user.certIssued || [];

    return (
        <div className="flex flex-col gap-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">Welcome!</span>{" "}
                    <span className="italic text-slate-900 dark:text-white">{user.firstName}</span>
                    <span className="animate-wave ml-2">👋</span>
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Detailed information and issued certificates</p>
            </div>

            {/* User Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b px-6 py-4 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Student ID</p>
                        <p className="font-medium text-slate-900 dark:text-white">{user.studentId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {user.firstName} {user.middleName} {user.lastName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                        <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sex</p>
                        <p className="font-medium text-slate-900 dark:text-white">{user.sex}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                user.accountStatus === "APPROVED"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                            }`}
                        >
                            {user.accountStatus}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">College</p>
                        <p className="font-medium text-slate-900 dark:text-white">{user.college || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Department</p>
                        <p className="font-medium text-slate-900 dark:text-white">{user.department || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Major</p>
                        <p className="font-medium text-slate-900 dark:text-white">{user.major || "—"}</p>
                    </div>
                    <div className="max-w-full">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Wallet Address</p>
                        <p className="break-words font-medium text-slate-900 dark:text-white">{user.walletAddress || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Certificates Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b px-6 py-4 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Certificates Issued</h2>
                </div>
                <div className="overflow-x-auto p-6">
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400">Loading certificates...</p>
                    ) : error ? (
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                    ) : userCertificates.length > 0 ? (
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-slate-800">
                                <tr>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        #
                                    </th>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Certificate Title
                                    </th>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Institution
                                    </th>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Issued Date
                                    </th>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Certificate Status
                                    </th>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {userCertificates.map((cert, index) => (
                                    <tr
                                        key={cert._id}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800"
                                    >
                                        <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                            {index + 1}
                                        </td>
                                        <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                            {cert.nameOfCertificate}
                                        </td>
                                        <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                            {cert.nameOfInstitution}
                                        </td>
                                        <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                            {cert.dateIssued ? new Date(cert.dateIssued).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="border-b px-4 py-2 dark:border-slate-700">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                    cert.certStatus === "CONFIRMED"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                                        : cert.certStatus === "REVOKED"
                                                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                                                }`}
                                            >
                                                {cert.certStatus}
                                            </span>
                                        </td>

                                        <td className="border-b px-4 py-2 dark:border-slate-700">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow hover:bg-blue-600"
                                                    onClick={() => navigate(`/certificates/student/certificate/view/${cert._id}`)}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No certificates found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
