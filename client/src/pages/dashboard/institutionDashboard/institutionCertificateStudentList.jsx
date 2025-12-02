import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileDown, ArrowUpDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, clearUserState } from "../../../store/slices/userSlice";
import { clearUpdateAccountStatusState } from "../../../store/slices/updateUserAccountStatusSlice";
import { getAllColleges } from "../../../store/slices/collegeSlice";
import { getAllCourses } from "../../../store/slices/courseSlice";
import { getAllMajors } from "../../../store/slices/majorSlice";
import { message } from "antd";

const InstitutionCertificateStudentList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { loading: updating, success, error: updateError, message: updateMsg } = useSelector((state) => state.updateUserAccountStatus);
    const { colleges } = useSelector((state) => state.college);
    const { courses } = useSelector((state) => state.course);
    const { majors } = useSelector((state) => state.major);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCollege, setSelectedCollege] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedMajor, setSelectedMajor] = useState("");
    const [selectedCertificate, setSelectedCertificate] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
    const usersPerPage = 5;

    useEffect(() => {
        dispatch(getAllUsers());
        dispatch(getAllColleges());
        dispatch(getAllCourses());
        dispatch(getAllMajors());
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

    // Filter pending users, role filter, and search
    const filteredUsers = users
        .filter(
            (user) =>
                user.accountStatus === "APPROVED" &&
                user.role?.toUpperCase() === "STUDENT" &&
                user.certIssued?.some((cert) => cert.issuedBy?._id === loggedInUser._id),
        )
        .filter((user) => {
            const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        })
        .filter((user) => (selectedCollege ? user.college === selectedCollege : true))
        .filter((user) => (selectedCourse ? user.department === selectedCourse : true))
        .filter((user) => (selectedMajor ? user.major === selectedMajor : true))
        .filter((user) =>
            selectedCertificate
                ? user.certIssued?.some((cert) => cert.issuedBy?._id === loggedInUser._id && cert.nameOfCertificate === selectedCertificate)
                : true,
        )
        .sort((a, b) => {
            // Sort alphabetically by last name, then first name
            const lastNameA = a.lastName?.toLowerCase() || "";
            const lastNameB = b.lastName?.toLowerCase() || "";
            const firstNameA = a.firstName?.toLowerCase() || "";
            const firstNameB = b.firstName?.toLowerCase() || "";

            if (sortOrder === "asc") {
                if (lastNameA !== lastNameB) {
                    return lastNameA.localeCompare(lastNameB);
                }
                return firstNameA.localeCompare(firstNameB);
            } else {
                if (lastNameA !== lastNameB) {
                    return lastNameB.localeCompare(lastNameA);
                }
                return firstNameB.localeCompare(firstNameA);
            }
        });

    // ✅ Collect certificate names issued by this institution
    const institutionCertificates = [
        ...new Set(
            users
                .flatMap((user) => user.certIssued?.filter((cert) => cert.issuedBy?._id === loggedInUser._id).map((cert) => cert.nameOfCertificate))
                .filter(Boolean), // remove null/undefined
        ),
    ];

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Toggle sort order
    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setCurrentPage(1); // Reset to first page when sorting
    };

    // ✅ Export CSV without any dependency
    const exportInstitutionsCSV = () => {
        if (filteredUsers.length === 0) {
            message.warning("No approved institutions found.");
            return;
        }

        const csvHeader = [
            "#",
            "Student Number",
            "First Name",
            "Middle Name",
            "Last Name",
            "Sex",
            "Email",
            "Role",
            "College",
            "Department",
            "Major",
            "Status",
            "Certificates",
            "Wallet Address",
        ];

        const csvRows = filteredUsers.map((user, index) => {
            const certs =
                user.certIssued
                    ?.filter((cert) => cert.issuedBy?._id === loggedInUser._id)
                    .map((cert) => cert.nameOfCertificate)
                    .join("; ") || "";

            return [
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
                user.accountStatus,
                certs,
                user.walletAddress,
            ];
        });

        const csvContent = [csvHeader, ...csvRows].map((row) => row.map((val) => `"${val}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "approved_students.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Students</h1>

            <div className="flex flex-col gap-4">
                <div className="mb-4 flex items-center justify-between gap-4">
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

                    <div className="flex gap-2">
                        {/* Sort Button */}
                        <button
                            onClick={toggleSortOrder}
                            className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                            title={`Sort ${sortOrder === "asc" ? "Z-A" : "A-Z"}`}
                        >
                            <ArrowUpDown size={16} />
                            {sortOrder === "asc" ? "A-Z" : "Z-A"}
                        </button>

                        <button
                            onClick={exportInstitutionsCSV}
                            className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                        >
                            <FileDown size={16} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* <select
                            value={selectedCollege}
                            onChange={(e) => {
                                setSelectedCollege(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">All Colleges</option>
                            {colleges.map((college) => (
                                <option key={college._id} value={college.collegeName}>
                                    {college.collegeName}
                                </option>
                            ))}
                        </select> */}

                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">All Courses</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course.courseName}>
                                    {course.courseName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedMajor}
                            onChange={(e) => {
                                setSelectedMajor(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">All Majors</option>
                            {majors.map((major) => (
                                <option key={major._id} value={major.majorName}>
                                    {major.majorName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedCertificate}
                            onChange={(e) => {
                                setSelectedCertificate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">All Certificates</option>
                            {institutionCertificates.map((certName, idx) => (
                                <option key={idx} value={certName}>
                                    {certName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-gray-200 p-4 dark:border-slate-700">
                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                        List of Students {sortOrder === "asc" ? "(A-Z)" : "(Z-A)"}
                    </p>
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
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Student Number</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">First Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Middle Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Last Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Sex</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Email</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Role</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">College</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Department</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Major</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Certificates of Student</th>
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
                                                <td className="whitespace-nowrap border-b px-4 py-2 font-bold text-green-500 dark:border-slate-700">
                                                    {user.certIssued && user.certIssued.length > 0 ? (
                                                        <div
                                                            className="max-w-[200px] truncate"
                                                            title={user.certIssued
                                                                .filter((cert) => cert.issuedBy?._id === loggedInUser._id)
                                                                .map((cert) => cert.nameOfCertificate || "Unnamed Certificate")
                                                                .join(", ")}
                                                        >
                                                            {user.certIssued
                                                                .filter((cert) => cert.issuedBy?._id === loggedInUser._id)
                                                                .slice(0, 3) // show only first 3 badges in table
                                                                .map((cert, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="mr-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                                    >
                                                                        {cert.nameOfCertificate || "Unnamed Certificate"}
                                                                    </span>
                                                                ))}
                                                            {user.certIssued.filter((cert) => cert.issuedBy?._id === loggedInUser._id).length > 3 && (
                                                                <span className="text-xs text-gray-500">+ more</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No Certificates</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap border-b px-4 py-2 font-bold text-green-500 dark:border-slate-700">
                                                    {user.accountStatus}
                                                </td>
                                                <td className="flex gap-2 whitespace-nowrap border-b px-4 py-2 font-bold text-yellow-500 dark:border-slate-700">
                                                    <button
                                                        className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                                                        onClick={() => navigate(`/certificates/student/details/${user._id}`)}
                                                        disabled={updating}
                                                    >
                                                        View
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

export default InstitutionCertificateStudentList;

