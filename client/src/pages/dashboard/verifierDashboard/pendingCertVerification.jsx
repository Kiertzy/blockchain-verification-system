import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileDown, ArrowUpDown, CheckSquare, Square, CheckCircle, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, clearUserState } from "../../../store/slices/userSlice";
import { getAllColleges } from "../../../store/slices/collegeSlice";
import { getAllCourses } from "../../../store/slices/courseSlice";
import { getAllMajors } from "../../../store/slices/majorSlice";
import { verifyCertificate, verifyBulkCertificates, clearVerifyCertificateState } from "../../../store/slices/certificateSlice";
import { message, Modal } from "antd";

const PendingCertVerification = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);
    const { colleges } = useSelector((state) => state.college);
    const { courses } = useSelector((state) => state.course);
    const { majors } = useSelector((state) => state.major);
    const { 
        loading: singleLoading, 
        error: singleError, 
        message: singleSuccessMsg, 
        certificateData,
        bulkLoading, 
        bulkError, 
        bulkResults 
    } = useSelector((state) => state.certificate);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCollege, setSelectedCollege] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedMajor, setSelectedMajor] = useState("");
    const [selectedCertificate, setSelectedCertificate] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [selectedCertHashes, setSelectedCertHashes] = useState(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSingleVerifyModal, setIsSingleVerifyModal] = useState(false);

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

    // Clear verification results when modals close
    useEffect(() => {
        if (!isModalOpen && !isSingleVerifyModal) {
            dispatch(clearVerifyCertificateState());
        }
    }, [isModalOpen, isSingleVerifyModal, dispatch]);

    // Collect unique certificate names with PENDING status
    const pendingCertificates = [
        ...new Set(
            users
                .flatMap((user) =>
                    user.certIssued
                        ?.filter((cert) => cert.certVerificationStatus === "PENDING")
                        .map((cert) => cert.nameOfCertificate)
                )
                .filter(Boolean)
        ),
    ].sort();

    // Filter students with PENDING certificates
    const filteredUsers = users
        .filter((user) => {
            if (user.accountStatus !== "APPROVED" || user.role?.toUpperCase() !== "STUDENT") {
                return false;
            }

            const hasPendingCert = user.certIssued?.some(
                (cert) => cert.certVerificationStatus === "PENDING"
            );

            return hasPendingCert;
        })
        .filter((user) => {
            const fullName = `${user.firstName} ${user.middleName || ""} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        })
        .filter((user) => (selectedCollege ? user.college === selectedCollege : true))
        .filter((user) => (selectedCourse ? user.department === selectedCourse : true))
        .filter((user) => (selectedMajor ? user.major === selectedMajor : true))
        .filter((user) =>
            selectedCertificate
                ? user.certIssued?.some(
                      (cert) =>
                          cert.nameOfCertificate === selectedCertificate &&
                          cert.certVerificationStatus === "PENDING"
                  )
                : true
        )
        .sort((a, b) => {
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

    // Get all pending certificate hashes from filtered users
    const getAllPendingCertHashes = () => {
        const hashes = [];
        filteredUsers.forEach((user) => {
            user.certIssued
                ?.filter((cert) => cert.certVerificationStatus === "PENDING")
                .forEach((cert) => {
                    hashes.push({
                        certHash: cert.certHash,
                        studentName: user.firstName + " " + user.lastName,
                        certName: cert.nameOfCertificate,
                    });
                });
        });
        return hashes;
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setCurrentPage(1);
    };

    const handleCertHashToggle = (certHash) => {
        const newSelected = new Set(selectedCertHashes);
        if (newSelected.has(certHash)) {
            newSelected.delete(certHash);
        } else {
            newSelected.add(certHash);
        }
        setSelectedCertHashes(newSelected);
    };

    const handleSelectAll = () => {
        const allHashes = getAllPendingCertHashes().map((item) => item.certHash);
        if (selectedCertHashes.size === allHashes.length) {
            setSelectedCertHashes(new Set());
        } else {
            setSelectedCertHashes(new Set(allHashes));
        }
    };

    const handleVerify = () => {
        if (selectedCertHashes.size === 0) {
            message.warning("Please select at least one certificate to verify");
            return;
        }

        // Single certificate verification
        if (selectedCertHashes.size === 1) {
            const certHash = Array.from(selectedCertHashes)[0];
            dispatch(verifyCertificate(certHash));
            setIsSingleVerifyModal(true);
        } 
        // Bulk verification
        else {
            const hashes = Array.from(selectedCertHashes);
            dispatch(verifyBulkCertificates(hashes));
            setIsModalOpen(true);
        }
    };

    const exportPendingStudentsCSV = () => {
        if (filteredUsers.length === 0) {
            message.warning("No students with pending certificates found.");
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
            "College",
            "Department",
            "Major",
            "Pending Certificates",
            "Pending Count",
            "Wallet Address",
        ];

        const csvRows = filteredUsers.map((user, index) => {
            const pendingCerts = user.certIssued
                ?.filter((cert) => cert.certVerificationStatus === "PENDING")
                .map((cert) => cert.nameOfCertificate)
                .join("; ") || "";

            const pendingCount = user.certIssued?.filter(
                (cert) => cert.certVerificationStatus === "PENDING"
            ).length || 0;

            return [
                index + 1,
                user.studentId || "",
                user.firstName,
                user.middleName || "",
                user.lastName,
                user.sex,
                user.email,
                user.college || "",
                user.department || "",
                user.major || "",
                pendingCerts,
                pendingCount,
                user.walletAddress,
            ];
        });

        const csvContent = [csvHeader, ...csvRows]
            .map((row) => row.map((val) => `"${val}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "pending_certificates_students.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportVerifiedCertificatesCSV = () => {
        const verified = bulkResults.filter((r) => r.status === "success");

        if (verified.length === 0) {
            message.warning("No verified certificates to export.");
            return;
        }

        const csvHeader = [
            "#",
            "Certificate Hash",
            "Institution",
            "Certificate Name",
            "Student Name",
            "College",
            "Course",
            "Major",
            "Date Issued",
            "Verification Status",
        ];

        const csvRows = verified.map((result, index) => [
            index + 1,
            result.certHash,
            result.certificate.nameOfInstitution,
            result.certificate.nameOfCertificate,
            result.certificate.nameOfStudent,
            result.certificate.college,
            result.certificate.course,
            result.certificate.major || "",
            new Date(result.certificate.dateIssued).toLocaleDateString(),
            result.certificate.certVerificationStatus || "VERIFIED",
        ]);

        const csvContent = [csvHeader, ...csvRows]
            .map((row) => row.map((val) => `"${val}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "verified_certificates.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getPendingCertCount = (user) => {
        return user.certIssued?.filter(
            (cert) => cert.certVerificationStatus === "PENDING"
        ).length || 0;
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCertHashes(new Set());
        dispatch(clearVerifyCertificateState());
        dispatch(getAllUsers());
    };

    const handleSingleModalClose = () => {
        setIsSingleVerifyModal(false);
        setSelectedCertHashes(new Set());
        dispatch(clearVerifyCertificateState());
        dispatch(getAllUsers());
    };

    // Calculate verification summary
    const verificationSummary = {
        total: bulkResults.length,
        verified: bulkResults.filter((r) => r.status === "success").length,
        failed: bulkResults.filter((r) => r.status === "failed").length,
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Pending Certificates</h1>

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
                        <button
                            onClick={toggleSortOrder}
                            className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                            title={`Sort ${sortOrder === "asc" ? "Z-A" : "A-Z"}`}
                        >
                            <ArrowUpDown size={16} />
                            {sortOrder === "asc" ? "A-Z" : "Z-A"}
                        </button>

                        <button
                            onClick={exportPendingStudentsCSV}
                            className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                        >
                            <FileDown size={16} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
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
                        </select>

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
                            {pendingCertificates.map((certName, idx) => (
                                <option key={idx} value={certName}>
                                    {certName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedCertHashes.size > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                            {selectedCertHashes.size} certificate(s) selected
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedCertHashes(new Set())}
                                className="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
                            >
                                Clear Selection
                            </button>
                            <button
                                onClick={handleVerify}
                                className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700"
                            >
                                {selectedCertHashes.size === 1 ? "Verify Certificate" : `Bulk Verify (${selectedCertHashes.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    ⏳ Total Students with Pending Certificates: <span className="text-lg">{filteredUsers.length}</span>
                </p>
            </div>

            {/* Table */}
            <div className="rounded border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-gray-200 p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                            Students with Pending Certificates {sortOrder === "asc" ? "(A-Z)" : "(Z-A)"}
                        </p>
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            {selectedCertHashes.size === getAllPendingCertHashes().length ? (
                                <>
                                    <CheckSquare size={18} />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <Square size={18} />
                                    Select All
                                </>
                            )}
                        </button>
                    </div>
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
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Select</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">#</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Student Number</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">First Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Middle Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Last Name</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Sex</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Email</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">College</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Department</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Major</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Pending Certificates</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">Count</th>
                                        <th className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700" style={{ width: "150px" }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length > 0 ? (
                                        currentUsers.map((user, index) => {
                                            const pendingCerts = user.certIssued?.filter(
                                                (cert) => cert.certVerificationStatus === "PENDING"
                                            ) || [];

                                            return (
                                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                                                    <td className="border-b px-4 py-2 dark:border-slate-700">
                                                        <div className="flex flex-col gap-1">
                                                            {pendingCerts.map((cert, idx) => (
                                                                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedCertHashes.has(cert.certHash)}
                                                                        onChange={() => handleCertHashToggle(cert.certHash)}
                                                                        className="h-4 w-4 cursor-pointer"
                                                                    />
                                                                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[100px]" title={cert.nameOfCertificate}>
                                                                        {cert.nameOfCertificate}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>
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
                                                        {user.middleName || "—"}
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
                                                        {user.college || "—"}
                                                    </td>
                                                    <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                        {user.department || "—"}
                                                    </td>
                                                    <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                                        {user.major || "—"}
                                                    </td>
                                                    <td className="border-b px-4 py-2 dark:border-slate-700">
                                                        {pendingCerts.length > 0 ? (
                                                            <div
                                                                className="max-w-[200px] truncate"
                                                                title={pendingCerts
                                                                    .map((cert) => cert.nameOfCertificate || "Unnamed Certificate")
                                                                    .join(", ")}
                                                            >
                                                                {pendingCerts
                                                                    .slice(0, 2)
                                                                    .map((cert, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="mr-1 mb-1 inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                                                        >
                                                                            {cert.nameOfCertificate || "Unnamed"}
                                                                        </span>
                                                                    ))}
                                                                {pendingCerts.length > 2 && (
                                                                    <span className="text-xs text-gray-500">+ more</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">No Certificates</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap border-b px-4 py-2 text-center dark:border-slate-700">
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                                                            {getPendingCertCount(user)}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap border-b px-4 py-2 dark:border-slate-700">
                                                        <button
                                                            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                                                            onClick={() => navigate(`/verifier/certificates/student-details/${user._id}`)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="14" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                                                No students with pending certificates found.
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

            {/* Single Certificate Verification Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-slate-600">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Certificate Verification
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Single certificate verification result
                            </p>
                        </div>
                    </div>
                }
                open={isSingleVerifyModal}
                onCancel={handleSingleModalClose}
                width={700}
                footer={null}
                className="verification-modal"
                styles={{
                    body: {
                        padding: 0,
                    },
                }}
            >
                <div className="bg-white p-6 dark:bg-slate-800">
                    {/* Loading State */}
                    {singleLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400"></div>
                            <p className="mt-4 text-center text-slate-600 dark:text-slate-300">
                                Verifying certificate...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {singleError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-300">
                                        Verification Failed
                                    </h4>
                                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">{singleError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {singleSuccessMsg && certificateData && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/30">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-green-900 dark:text-green-200">
                                            ✅ Certificate Verified Successfully
                                        </h4>
                                        <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                                            {singleSuccessMsg}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700">
                                <h4 className="font-semibold text-slate-900 dark:text-white">Certificate Details</h4>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Institution</p>
                                        <p className="text-slate-900 dark:text-white">{certificateData.nameOfInstitution}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Certificate Name</p>
                                        <p className="text-slate-900 dark:text-white">{certificateData.nameOfCertificate}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Student Name</p>
                                        <p className="text-slate-900 dark:text-white">{certificateData.nameOfStudent}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">College</p>
                                        <p className="text-slate-900 dark:text-white">{certificateData.college}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Course</p>
                                        <p className="text-slate-900 dark:text-white">{certificateData.course}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Major</p>
                                        <p className="text-slate-900 dark:text-white">{certificateData.major || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Date Issued</p>
                                        <p className="text-slate-900 dark:text-white">
                                            {new Date(certificateData.dateIssued).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Status</p>
                                        <span className="inline-block rounded-full bg-green-200 px-2.5 py-0.5 text-xs font-medium text-green-900 dark:bg-green-800 dark:text-green-100">
                                            {certificateData.certStatus}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-600 dark:text-slate-400">Verification</p>
                                        <span className="inline-block rounded-full bg-green-200 px-2.5 py-0.5 text-xs font-medium text-green-900 dark:bg-green-800 dark:text-green-100">
                                            {certificateData.certVerificationStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* <div className="pt-2">
                                    <p className="font-medium text-slate-600 dark:text-slate-400">Certificate Hash</p>
                                    <p className="break-all font-mono text-xs text-slate-900 dark:text-white">
                                        {certificateData.certHash}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">Transaction Hash</p>
                                    <p className="break-all font-mono text-xs text-slate-900 dark:text-white">
                                        {certificateData.txHash}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">Student Wallet</p>
                                    <p className="break-all font-mono text-xs text-slate-900 dark:text-white">
                                        {certificateData.walletAddressStudent}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">Institution Wallet</p>
                                    <p className="break-all font-mono text-xs text-slate-900 dark:text-white">
                                        {certificateData.walletAddressInstitution}
                                    </p>
                                </div> */}

                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSingleModalClose}
                                    className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Bulk Verification Results Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-slate-600">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Bulk Verification Results
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {verificationSummary.total} certificate(s) processed
                            </p>
                        </div>
                    </div>
                }
                open={isModalOpen}
                onCancel={handleModalClose}
                width={900}
                footer={null}
                className="verification-modal"
                styles={{
                    body: {
                        padding: 0,
                    },
                }}
            >
                <div className="bg-white p-6 dark:bg-slate-800">
                    {/* Loading State */}
                    {bulkLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400"></div>
                            <p className="mt-4 text-center text-slate-600 dark:text-slate-300">
                                Verifying certificates...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {bulkError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-300">
                                        Verification Error
                                    </h4>
                                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">{bulkError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {bulkResults.length > 0 && (
                        <>
                            {/* Summary Statistics */}
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Total Processed
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                                        {verificationSummary.total}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/30">
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        ✅ Verified
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-green-800 dark:text-green-200">
                                        {verificationSummary.verified}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/30">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                        ❌ Failed
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-200">
                                        {verificationSummary.failed}
                                    </p>
                                </div>
                            </div>

                            {/* Results List */}
                            <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                                {bulkResults.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-lg border p-4 transition-all ${
                                            result.status === "success"
                                                ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30"
                                                : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {result.status === "success" ? (
                                                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4
                                                        className={`font-semibold ${
                                                            result.status === "success"
                                                                ? "text-green-900 dark:text-green-200"
                                                                : "text-red-900 dark:text-red-200"
                                                        }`}
                                                    >
                                                        {result.status === "success" ? "✅ Verified" : "❌ Failed"}
                                                    </h4>
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            result.status === "success"
                                                                ? "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100"
                                                                : "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100"
                                                        }`}
                                                    >
                                                        {result.status === "success" ? "VERIFIED" : "NOT VERIFIED"}
                                                    </span>
                                                </div>

                                                <div className="mt-2 space-y-1">
                                                    <p
                                                        className={`text-xs ${
                                                            result.status === "success"
                                                                ? "text-green-800 dark:text-green-300"
                                                                : "text-red-800 dark:text-red-300"
                                                        }`}
                                                    >
                                                        <span className="font-medium">Hash:</span>{" "}
                                                        <span className="font-mono">
                                                            {result.certHash.substring(0, 30)}...
                                                        </span>
                                                    </p>

                                                    {result.status === "success" ? (
                                                        <>
                                                            <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                                                <span className="font-semibold">Certificate:</span>{" "}
                                                                {result.certificate.nameOfCertificate}
                                                            </p>
                                                            <p className="text-sm text-green-900 dark:text-green-200">
                                                                <span className="font-semibold">Student:</span>{" "}
                                                                {result.certificate.nameOfStudent}
                                                            </p>
                                                            <p className="text-sm text-green-900 dark:text-green-200">
                                                                <span className="font-semibold">Institution:</span>{" "}
                                                                {result.certificate.nameOfInstitution}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                                            <span className="font-semibold">Error:</span> {result.error}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-slate-600">
                                <button
                                    onClick={exportVerifiedCertificatesCSV}
                                    disabled={verificationSummary.verified === 0}
                                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Export Verified (CSV)
                                </button>
                                <button
                                    onClick={handleModalClose}
                                    className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-700"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default PendingCertVerification;

