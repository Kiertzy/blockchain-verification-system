import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, clearUserState, deleteUser, clearDeleteState } from "../../../store/slices/userSlice";
import { clearUpdateAccountStatusState } from "../../../store/slices/updateUserAccountStatusSlice";
import { message, Modal } from "antd";

const { confirm } = Modal;

const Institutions = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users, loading, error, deleteLoading, deleteError, deleteMessage } = useSelector((state) => state.users);
    const { loading: updating, success, error: updateError, message: updateMsg } = useSelector((state) => state.updateUserAccountStatus);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    useEffect(() => {
        dispatch(getAllUsers());
        return () => {
            dispatch(clearUserState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            message.success(updateMsg);
            dispatch(getAllUsers());
            dispatch(clearUpdateAccountStatusState());
        }
        if (updateError) {
            message.error(updateError);
            dispatch(clearUpdateAccountStatusState());
        }
    }, [success, updateError, updateMsg, dispatch]);

    useEffect(() => {
        if (deleteMessage) {
            message.success(deleteMessage);
            dispatch(getAllUsers());
            dispatch(clearDeleteState());
        }
        if (deleteError) {
            message.error(deleteError);
            dispatch(clearDeleteState());
        }
    }, [deleteMessage, deleteError, dispatch]);

    // Filter pending users, role filter, and search
    const filteredUsers = users
        .filter((user) => user.accountStatus === "APPROVED" && user.role?.toUpperCase() === "INSTITUTION")
        .filter((user) => {
            const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        });

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // ✅ Export CSV without any dependency
    const exportInstitutionsCSV = () => {
        if (filteredUsers.length === 0) {
            message.warning("No approved institutions found.");
            return;
        }

        const csvHeader = [
            "#",
            "First Name",
            "Middle Name",
            "Last Name",
            "Sex",
            "Email",
            "Role",
            "Institution Name",
            "Institution Position",
            "Accreditation Info",
            "Status",
        ];

        const csvRows = filteredUsers.map((user, index) => [
            index + 1,
            user.firstName,
            user.middleName || "",
            user.lastName,
            user.sex,
            user.email,
            user.role,
            user.institutionName || "—",
            user.institutionPosition || "—",
            user.accreditationInfo || "—",
            user.accountStatus,
        ]);

        const csvContent = [csvHeader, ...csvRows]
            .map((row) => row.map((val) => `"${val}"`).join(",")) // quote values safely
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "approved_institutions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const showDeleteConfirm = (userId) => {
        confirm({
            title: "Are you sure you want to delete this user?",
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                dispatch(deleteUser(userId));
            },
        });
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Institutions</h1>

            <div className="mb-4 flex items-center justify-between gap-4">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full max-w-md rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />

                {/* Export Button */}
                <button
                    onClick={exportInstitutionsCSV}
                    className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                    <FileDown size={16} />
                    Export
                </button>
            </div>

            {/* Table */}
            <div className="rounded border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-gray-200 p-4 dark:border-slate-700">
                    <p className="text-lg font-medium text-slate-900 dark:text-white">List of Institutions</p>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-800 dark:text-white">Loading...</div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">{error}</div>
                    ) : (
                        <>
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                    <tr>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">#</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">First Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Middle Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Last Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Sex</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Email</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Role</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Institution</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Institution Position</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Accreditation Info</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Status</th>
                                        <th
                                            className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700"
                                            style={{ width: "200px" }}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length > 0 ? (
                                        currentUsers.map((user, index) => (
                                            <tr
                                                key={user._id}
                                                className="hover:bg-gray-50 dark:hover:bg-slate-800"
                                            >
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {indexOfFirstUser + index + 1}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.firstName}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.middleName}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.lastName}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.sex}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.email}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.role}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.institutionName || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.institutionPosition || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.accreditationInfo ? (
                                                        <a
                                                            href={user.accreditationInfo}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow transition hover:bg-blue-700"
                                                        >
                                                            📂 View File
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 font-bold text-green-500 dark:border-slate-700">
                                                    {user.accountStatus}
                                                </td>
                                                <td className="flex gap-2 whitespace-nowrap border-b px-4 py-2 font-bold text-yellow-500 dark:border-slate-700">
                                                    <button
                                                        className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                                                        onClick={() => navigate(`/certificates/admin/institution-details/${user._id}`)}
                                                        disabled={updating}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                                        onClick={() => showDeleteConfirm(user._id)}
                                                        disabled={updating}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="15"
                                                className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                No pending users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-x-2 py-4">
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`rounded border px-3 py-1 text-sm ${
                                                currentPage === index + 1
                                                    ? "bg-blue-500 text-white"
                                                    : "border-blue-500 bg-white text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-blue-600"
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Institutions;
