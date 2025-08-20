import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileDown } from "lucide-react";
import { getAllUsers, clearUserState } from "../../../store/slices/userSlice";
import { updateUserAccountStatus, clearUpdateAccountStatusState } from "../../../store/slices/updateUserAccountStatusSlice";
import { message, Modal, Input } from "antd";

const PendingUsers = () => {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);
    const { loading: updating, success, error: updateError, message: updateMsg } = useSelector((state) => state.updateUserAccountStatus);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [disapproveReason, setDisapproveReason] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
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

    // Handle role checkbox change
    const handleRoleChange = (role) => {
        setSelectedRoles(
            (prev) =>
                prev.includes(role)
                    ? prev.filter((r) => r !== role) // remove if already selected
                    : [...prev, role], // add if not selected
        );
        setCurrentPage(1);
    };

    // Get unique roles from users
    const availableRoles = [...new Set(users.map((user) => user.role))];

    // Filter pending users, role filter, and search
    const filteredUsers = users
        .filter((user) => user.accountStatus === "PENDING")
        .filter((user) => (selectedRoles.length > 0 ? selectedRoles.includes(user.role) : true))
        .filter((user) => {
            const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        });

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const confirmApprove = (userId) => {
        Modal.confirm({
            title: "Approve Account",
            content: "Are you sure you want to approve this account?",
            okText: "Yes, Approve",
            cancelText: "Cancel",
            onOk: () => {
                dispatch(updateUserAccountStatus({ userId, accountStatus: "APPROVED" }));
            },
        });
    };

    const openDisapproveModal = (user) => {
        setSelectedUser(user);
        setDisapproveReason("");
        setIsReasonModalOpen(true);
    };

    const handleDisapprove = () => {
        if (!disapproveReason.trim()) {
            return message.warning("Please enter a reason for disapproval.");
        }
        dispatch(
            updateUserAccountStatus({
                userId: selectedUser._id,
                accountStatus: "DISAPPROVED",
                reason: disapproveReason.trim(),
            }),
        );
        setIsReasonModalOpen(false);
    };

    // ✅ Export CSV without any dependency
    const exportInstitutionsCSV = () => {
        if (filteredUsers.length === 0) {
            message.warning("No pending user found.");
            return;
        }

        const csvHeader = [
            "#",
            "Student ID",
            "First Name",
            "Middle Name",
            "Last Name",
            "Sex",
            "Email",
            "Role",
            "College",
            "Department",
            "Major",
            "Institution",
            "Institution Position",
            "Accreditation Info",
            "Status",
            "Wallet Address",
        ];

        const csvRows = filteredUsers.map((user, index) => [
            index + 1,
            user.studentId,
            user.firstName,
            user.middleName || "",
            user.lastName,
            user.sex,
            user.email,
            user.role,
            user.college,
            user.department,
            user.major,
            user.institutionName,
            user.institutionPosition,
            user.accreditationInfo,
            user.accountStatus,
            user.walletAddress,
        ]);

        const csvContent = [csvHeader, ...csvRows]
            .map((row) => row.map((val) => `"${val}"`).join(",")) 
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "pending_users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Pending Users</h1>

            {/* Search & Role Filters */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
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

                    {/* Role Checkboxes */}
                    <div className="flex flex-wrap gap-4">
                        {availableRoles.map((role) => {
                            const isChecked = selectedRoles.includes(role);
                            return (
                                <label
                                    key={role}
                                    className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-800 dark:text-gray-200"
                                >
                                    <span
                                        onClick={() => handleRoleChange(role)}
                                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                                            isChecked
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                                        }`}
                                    >
                                        {isChecked && (
                                            <svg
                                                className="h-3 w-3 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    {role}
                                </label>
                            );
                        })}
                    </div>
                </div>
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
                    <p className="text-lg font-medium text-slate-900 dark:text-white">List of Pending Users</p>
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
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">School ID</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">First Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Middle Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Last Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Sex</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Email</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Role</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">College</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Department</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Major</th>
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
                                                    {user.studentId || "—"}
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
                                                    {user.college || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.department || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.major || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.institutionName || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.institutionPosition || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                    {user.accreditationInfo || "—"}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 font-bold text-yellow-500 dark:border-slate-700">
                                                    {user.accountStatus}
                                                </td>
                                                <td className="flex gap-2 whitespace-nowrap border-b px-4 py-2 font-bold text-yellow-500 dark:border-slate-700">
                                                    <button
                                                        className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                                                        onClick={() => confirmApprove(user._id)}
                                                        disabled={updating}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                                        onClick={() => openDisapproveModal(user)}
                                                        disabled={updating}
                                                    >
                                                        Disapprove
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

            {/* Disapprove Reason Modal */}
            <Modal
                title="Reason for Disapproval"
                open={isReasonModalOpen}
                onOk={handleDisapprove}
                onCancel={() => setIsReasonModalOpen(false)}
                okText="Disapprove"
                okButtonProps={{ danger: true }}
                confirmLoading={updating}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Enter reason for disapproval..."
                    value={disapproveReason}
                    onChange={(e) => setDisapproveReason(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default PendingUsers;
