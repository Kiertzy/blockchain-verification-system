import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, clearUserState } from "../../../store/slices/userSlice";

const AdminInstitutionDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedUser, loading, error } = useSelector((state) => state.users);
    const { loading: certLoading, error: certError, message: certMessage } = useSelector((state) => state.allCertificates);

    useEffect(() => {
        if (id) {
            dispatch(getUserById(id));
        }
        return () => {
            dispatch(clearUserState());
        };
    }, [id, dispatch]);

    if (loading) return <div className="p-6 text-slate-700 dark:text-slate-200">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!selectedUser) return <div className="p-6 text-gray-500 dark:text-gray-400">No institution found.</div>;

    const certificates = selectedUser.certificateIssued || [];

    // Helper function to count number of students per certificate name
    const countByCertificateName = (name) => {
        return certificates.filter(cert => cert.nameOfCertificate === name).length;
    };

    return (
        <div className="flex flex-col gap-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Institution Profile</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Detailed information and issued certificates</p>
            </div>

            {/* User Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b px-6 py-4 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Position</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.institutionPosition}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sex</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.sex}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                selectedUser.accountStatus === "APPROVED"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                            }`}
                        >
                            {selectedUser.accountStatus}
                        </span>
                    </div>

                    <div className="max-w-full">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Accreditation Info</p>
                        <p className="break-words font-medium text-slate-900 dark:text-white">{selectedUser.accreditationInfo || "—"}</p>
                    </div>

                    <div className="max-w-full">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Wallet Address</p>
                        <p className="break-words font-medium text-slate-900 dark:text-white">{selectedUser.walletAddress || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Certificates Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b px-6 py-4 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Certificates Issued</h2>
                </div>

                <div className="overflow-x-auto p-6">
                    {selectedUser.certificateIssued && selectedUser.certificateIssued.length > 0 ? (
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
                                        No. of Certificate issued to Students
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedUser.certificateIssued.map((cert, index) => (
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
                                            {countByCertificateName(cert.nameOfCertificate)}
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

export default AdminInstitutionDetails;

