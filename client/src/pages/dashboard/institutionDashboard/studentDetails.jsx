import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { getUserById, clearUserState } from "../../../store/slices/userSlice";
import { deleteCertificate, updateCertificateStatus } from "../../../store/slices/certViewSlice";

const StudentDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { selectedUser, loading, error } = useSelector((state) => state.users);
    const { loading: certLoading, error: certError, message: certMessage } = useSelector((state) => state.allCertificates);

    const { confirm } = Modal;

    useEffect(() => {
        if (id) {
            dispatch(getUserById(id));
        }
        return () => {
            dispatch(clearUserState());
        };
    }, [id, dispatch]);

    const handleDelete = (certId) => {
        confirm({
            title: "Are you sure you want to delete this certificate?",
            icon: <ExclamationCircleOutlined />,
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                try {
                    const resultAction = await dispatch(deleteCertificate(certId));

                    if (deleteCertificate.fulfilled.match(resultAction)) {
                        message.success("Certificate deleted successfully");
                        // Refresh student details to reflect the deleted cert
                        dispatch(getUserById(id));
                    } else {
                        message.error(resultAction.payload || "Failed to delete certificate");
                    }
                } catch (err) {
                    message.error("Something went wrong");
                }
            },
        });
    };

    const handleUpdateStatus = (certId, currentStatus) => {
        const action = currentStatus === "CONFIRMED" ? "REVOKE" : "CONFIRM";

        confirm({
            title: "Update Certificate Status",
            icon: <ExclamationCircleOutlined />,
            content: (
                <span>
                    Do you want to{" "}
                    <span
                        className={`inline-flex items-center rounded-full text-xs font-semibold ${
                            action === "CONFIRM" ? "text-green-700" : "text-red-700"
                        }`}
                    >
                        {action}
                    </span>{" "}
                    this certificate?
                </span>
            ),
            okText: "Yes",
            cancelText: "Cancel",
            async onOk() {
                try {
                    const newStatus = currentStatus === "CONFIRMED" ? "REVOKED" : "CONFIRMED";

                    const resultAction = await dispatch(updateCertificateStatus({ certId, certStatus: newStatus }));

                    if (updateCertificateStatus.fulfilled.match(resultAction)) {
                        message.success("Certificate status updated successfully");
                        // refresh student details
                        dispatch(getUserById(id));
                    } else {
                        message.error(resultAction.payload || "Failed to update certificate status");
                    }
                } catch (err) {
                    message.error("Something went wrong");
                }
            },
        });
    };

    if (loading) return <div className="p-6 text-slate-700 dark:text-slate-200">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!selectedUser) return <div className="p-6 text-gray-500 dark:text-gray-400">No student found.</div>;

    return (
        <div className="flex flex-col gap-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
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
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.studentId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}
                        </p>
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
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">College</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.college || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Department</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.department || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Major</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.major || "—"}</p>
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
                    {selectedUser.certIssued && selectedUser.certIssued.length > 0 ? (
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
                                {selectedUser.certIssued
                                    .filter((cert) => cert.issuedBy?._id === loggedInUser._id) // ✅ only show certs from this logged in institution
                                    .map((cert, index) => (
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
                                                        onClick={() => navigate(`/certificate/details/${cert._id}`)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white shadow hover:bg-yellow-600"
                                                        onClick={() => handleUpdateStatus(cert._id, cert.certStatus)}
                                                    >
                                                        Update Status
                                                    </button>

                                                    <button
                                                        className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white shadow hover:bg-red-600"
                                                        onClick={() => handleDelete(cert._id)}
                                                        disabled={certLoading}
                                                    >
                                                        {certLoading ? "Deleting..." : "Delete"}
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

export default StudentDetails;
