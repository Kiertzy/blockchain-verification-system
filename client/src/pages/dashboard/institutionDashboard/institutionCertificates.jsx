import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { issueCertificate, clearIssueCertificateState } from "../../../store/slices/issueCertificateSlice";
import { getAllUsers } from "../../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Use env variables in production!
const CLOUD_NAME = "duifaweje"; // 🔹 replace with your Cloudinary cloud name
const UPLOAD_PRESET = "student_certificates"; // 🔹 replace with your unsigned upload preset

const InstitutionCertificate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.users);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    const { loading, error, message: successMsg, issuedCertificate, blockchainData } = useSelector((state) => state.issueCertificate);

    const [selectedImageFile, setSelectedImageFile] = useState(null);

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
        ipfsCID: "", // (you can rename this to cloudinaryUrl if you want)
    });

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error || successMsg) {
            dispatch(clearIssueCertificateState());
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
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
            // 1️⃣ Upload image to Cloudinary
            const formDataCloud = new FormData();
            formDataCloud.append("file", selectedImageFile);
            formDataCloud.append("upload_preset", UPLOAD_PRESET);

            const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formDataCloud);

            const cloudinaryUrl = res.data.secure_url;

            // 2️⃣ Merge into form data
            const finalFormData = {
                ...formData,
                imageOfCertificate: cloudinaryUrl,
                ipfsCID: res.data.public_id, // optional, you can rename this to cloudinaryId
            };

            console.log("✅ Certificate uploaded to Cloudinary:", cloudinaryUrl);

            // 3️⃣ Dispatch to backend / blockchain
            dispatch(issueCertificate(finalFormData));
        } catch (error) {
            console.error("❌ Cloudinary upload failed:", error);
            message.error("Failed to upload image to Cloudinary");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6">
            <h1 className="title text-slate-900 dark:text-white">Issue Student Certificate</h1>

            <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 sm:max-w-md"
            />
            {searchQuery && (
                <div className="max-h-60 w-full overflow-auto rounded-md border border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800 sm:max-w-md">
                    {filteredUsers?.length > 0 ? (
                        filteredUsers.map((student) => (
                            <div
                                key={student._id}
                                className="cursor-pointer px-4 py-2 text-slate-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-900"
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

            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-full flex-col gap-4 sm:max-w-2xl"
            >
                {[
                    { name: "nameOfInstitution", label: "Institution Name", disabled: true },
                    { name: "nameOfStudent", label: "Student Name", disabled: true },
                    { name: "college", label: "College", disabled: true },
                    { name: "course", label: "Course", disabled: true },
                    { name: "major", label: "Major", disabled: true },
                    { name: "certStatus", label: "Certificate Status", disabled: true },
                    { name: "walletAddressInstitution", label: "Institution Wallet", disabled: true },
                    { name: "walletAddressStudent", label: "Student Wallet", disabled: true },
                    { name: "nameOfCertificate", label: "Certificate Name" },
                ].map((field) => (
                    <input
                        key={field.name}
                        type="text"
                        name={field.name}
                        placeholder={field.label}
                        value={formData[field.name]}
                        onChange={handleChange}
                        disabled={field.disabled}
                        className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 disabled:dark:bg-slate-700"
                    />
                ))}

                <label className="text-sm font-semibold dark:text-white">Image of Certificate</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />

                <input
                    type="datetime-local"
                    name="dateIssued"
                    value={formData.dateIssued.slice(0, 16)}
                    onChange={(e) => {
                        const val = new Date(e.target.value).toISOString();
                        setFormData((prev) => ({ ...prev, dateIssued: val }));
                    }}
                    disabled
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white disabled:dark:bg-slate-700"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? "Issuing..." : "Issue Certificate"}
                </button>
            </form>

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
                        target="_blank"
                        rel="noopener noreferrer"
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
