import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { issueCertificate, clearIssueCertificateState } from "../../../store/slices/issueCertificateSlice";
import { getAllUsers } from "../../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CLOUD_NAME = "duifaweje";
const UPLOAD_PRESET = "student_certificates";

const InstitutionCertificate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.users);
    const { loading, error, message: successMsg, issuedCertificate, blockchainData } = useSelector((state) => state.issueCertificate);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [isDuplicate, setIsDuplicate] = useState(false);

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (successMsg && issuedCertificate) {
            message.success("Certificate issued successfully!");
        }
    }, [successMsg, issuedCertificate]);

    // Filter approved students
    const filteredUsers = users
        ?.filter((user) => user.accountStatus?.toUpperCase() === "APPROVED" && user.role?.toUpperCase() === "STUDENT")
        ?.filter((user) => {
            const fullName = `${user.firstName} ${user.middleName || ""} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        });

    const institutionData = {
        institutionName: currentUser?.institutionName || "",
        walletAddressInstitution: currentUser?.walletAddress || "",
        issuedBy: currentUser?._id || "",
    };

    const [formData, setFormData] = useState({
        nameOfInstitution: institutionData.institutionName,
        nameOfCertificate: "",
        nameOfStudent: "",
        college: "",
        course: "",
        major: "",
        certStatus: "CONFIRMED",
        walletAddressInstitution: institutionData.walletAddressInstitution,
        walletAddressStudent: "",
        dateIssued: new Date().toISOString(),
        issuedBy: institutionData.issuedBy,
        issuedTo: "",
        imageOfCertificate: "",
        ipfsCID: "",
    });

    // 🔹 Check duplicate when certificate name changes
    const checkDuplicate = (certName, student) => {
        if (!certName || !student?.certIssued) return false;
        return student.certIssued.some(
            (cert) => cert.issuedBy?._id === currentUser._id && cert.certificateName?.toLowerCase() === certName.toLowerCase(),
        );
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setFormData((prev) => ({
            ...prev,
            nameOfStudent: `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim(),
            college: student.college || "",
            course: student.department || "",
            major: student.major || "",
            walletAddressStudent: student.walletAddress || "",
            issuedTo: student._id || "",
        }));
        setSearchQuery("");
    };

    const toTitleCase = (str) => {
        return str
            .toLowerCase()
            .split(" ")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        let newValue = value;
        let formattedValue = value;

        if (name === "nameOfCertificate") {
            newValue = toTitleCase(value);

            formattedValue = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

            if (selectedStudent) {
                const duplicate = checkDuplicate(newValue, selectedStudent);
                setIsDuplicate(duplicate);
                if (duplicate) {
                    message.warning("This certificate has already been issued to the student.");
                }
            }
        }

        if (error || successMsg) {
            dispatch(clearIssueCertificateState());
        }

        setFormData((prev) => ({
            ...prev,
            [name]: formattedValue,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isDuplicate) {
            message.error("Duplicate detected: Certificate already issued to this student.");
            return;
        }

        const requiredFields = [
            "nameOfInstitution",
            "nameOfCertificate",
            "nameOfStudent",
            "college",
            "course",
            "major",
            "certStatus",
            "walletAddressInstitution",
            "walletAddressStudent",
            "dateIssued",
            "issuedBy",
            "issuedTo",
        ];

        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === "") {
                message.error(`Missing required field: ${field}`);
                return;
            }
        }

        if (!selectedImageFile) {
            message.error("Please select an image file for the certificate");
            return;
        }

        try {
            const formDataCloud = new FormData();
            formDataCloud.append("file", selectedImageFile);
            formDataCloud.append("upload_preset", UPLOAD_PRESET);

            const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formDataCloud);

            const cloudinaryUrl = res.data.secure_url;

            const finalFormData = {
                ...formData,
                imageOfCertificate: cloudinaryUrl,
                ipfsCID: res.data.public_id,
            };

            dispatch(issueCertificate(finalFormData));
        } catch (error) {
            message.error("Failed to upload image to Cloudinary");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Issue Student Certificate</h1>

            {/* 🔎 Student Search */}
            <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:max-w-md"
            />
            {searchQuery && (
                <div className="max-h-60 w-full overflow-auto rounded-md border border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800 sm:max-w-md">
                    {filteredUsers?.length > 0 ? (
                        filteredUsers.map((student) => (
                            <div
                                key={student._id}
                                className="cursor-pointer px-4 py-2 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-900"
                                onClick={() => handleStudentSelect(student)}
                            >
                                {student.firstName} {student.middleName} {student.lastName}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-slate-500 dark:text-slate-400">No matching students</div>
                    )}
                </div>
            )}

            {/* 🔹 Show already issued certs */}
            {selectedStudent?.certIssued?.length > 0 && (
                <div className="w-full max-w-2xl rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <h2 className="mb-2 font-semibold text-slate-800 dark:text-white">Already Issued Certificates:</h2>
                    <div className="flex flex-wrap gap-2">
                        {selectedStudent.certIssued
                            .filter((cert) => cert.issuedBy?._id === currentUser._id)
                            .map((cert, idx) => (
                                <span
                                    key={idx}
                                    className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                >
                                    {cert.nameOfCertificate}
                                </span>
                            ))}
                    </div>
                </div>
            )}

            {/* 🔹 Issue Certificate Form */}
<form
    onSubmit={handleSubmit}
    className="w-full max-w-2xl"
>
    <div className="grid grid-cols-2 gap-4">
        {[
            { name: "nameOfInstitution", label: "Institution Name", disabled: true, span: 2 },
            { name: "nameOfStudent", label: "Student Name", disabled: true },
            { name: "college", label: "College", disabled: true },
            { name: "course", label: "Course", disabled: true },
            { name: "major", label: "Major", disabled: true },
            { name: "walletAddressInstitution", label: "Institution Wallet", disabled: true },
            { name: "walletAddressStudent", label: "Student Wallet", disabled: true },
            { name: "nameOfCertificate", label: "Certificate Name", span: 2 },
        ].map((field) => (
            <div
                key={field.name}
                className={`${field.span === 2 ? "col-span-2" : ""}`}
            >
                <label
                    htmlFor={field.name}
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    {field.label}
                </label>
                <input
                    id={field.name}
                    type="text"
                    name={field.name}
                    placeholder={field.label}
                    value={formData[field.name]}
                    onChange={handleChange}
                    disabled={field.disabled}
                    className={`w-full rounded-md border px-4 py-2 text-sm ${
                        isDuplicate && field.name === "nameOfCertificate"
                            ? "border-red-500"
                            : "border-slate-300"
                    } dark:border-slate-600 dark:bg-slate-800 dark:text-white`}
                />
            </div>
        ))}

        {/* Upload Image */}
        <div className="col-span-2">
            <label className="mb-1 block text-sm font-semibold dark:text-white">
                Upload Certificate Image
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
        </div>

        {/* Submit button full width */}
        <div className="col-span-2">
            <button
                type="submit"
                disabled={loading || isDuplicate}
                className={`w-full rounded px-4 py-2 text-white ${
                    isDuplicate
                        ? "bg-gray-500"
                        : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-50`}
            >
                {loading
                    ? "Issuing..."
                    : isDuplicate
                    ? "Duplicate Certificate Detected"
                    : "Issue Certificate"}
            </button>
        </div>
    </div>
</form>

            {/* Alerts */}
            {error && (
                <div className="mt-4 max-w-full break-words rounded border border-red-500 bg-red-100 px-4 py-2 text-center text-red-700 dark:bg-red-800 dark:text-red-300 sm:max-w-md">
                    {error}
                </div>
            )}

            {successMsg && issuedCertificate && (
                <div className="mt-6 max-w-full break-words rounded border border-green-500 bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-300 sm:max-w-2xl">
                    <h2 className="mb-2 text-lg font-semibold">Certificate Issued ✅</h2>
                    <p>
                        <strong>Message:</strong> {successMsg}
                    </p>
                    <p>
                        <strong>Certificate Hash:</strong> {issuedCertificate.certHash}
                    </p>
                    <p>
                        <strong>Transaction Hash:</strong> {blockchainData?.txHash}
                    </p>

                    <button
                        onClick={() => navigate(`/certificate/${issuedCertificate._id}`)}
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        View Certificate Details
                    </button>
                </div>
            )}
        </div>
    );
};

export default InstitutionCertificate;
