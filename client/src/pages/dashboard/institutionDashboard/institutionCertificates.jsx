import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { NFTStorage, File } from "nft.storage";  // npm install nft.storage
import {
    issueCertificate,
    clearIssueCertificateState,
} from "../../../store/slices/issueCertificateSlice";
import { getAllUsers } from "../../../store/slices/userSlice";

// Put your nft.storage API key here or better, use env variables
const NFT_STORAGE_KEY = "2049116d.a1949d4dc7ba4a09a66a44043a71cd8f";
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

const InstitutionCertificate = () => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.users);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    const {
        loading,
        error,
        message: successMsg,
        issuedCertificate,
        blockchainData,
    } = useSelector((state) => state.issueCertificate);

    // New state for selected image file
    const [selectedImageFile, setSelectedImageFile] = useState(null);

    // Filter approved students only
    const filteredUsers = users
        ?.filter(
            (user) =>
                user.accountStatus?.toUpperCase() === "APPROVED" &&
                user.role?.toUpperCase() === "STUDENT"
        )
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

    // New handler for file input change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields except imageOfCertificate because it's now a file upload
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
            // Upload image to IPFS via nft.storage
            const metadata = await client.store({
                name: formData.nameOfCertificate,
                description: `Certificate for ${formData.nameOfStudent}`,
                image: new File([selectedImageFile], selectedImageFile.name, { type: selectedImageFile.type }),
            });

            // Convert ipfs:// URI to HTTPS gateway URL
            const ipfsImageUrl = metadata.data.image.href.replace("ipfs://", "https://ipfs.io/ipfs/");

            // Prepare final form data with IPFS image url
            const finalFormData = {
                ...formData,
                imageOfCertificate: ipfsImageUrl,
            };

            dispatch(issueCertificate(finalFormData));
        } catch (error) {
            console.error("IPFS upload failed:", error);
            message.error("Failed to upload image to IPFS");
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
                className="w-full sm:max-w-md rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            {searchQuery && (
                <div className="w-full sm:max-w-md border border-slate-300 rounded-md bg-white shadow-md dark:border-slate-600 dark:bg-slate-800 max-h-60 overflow-auto">
                    {filteredUsers?.length > 0 ? (
                        filteredUsers.map((student) => (
                            <div
                                key={student._id}
                                className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-900 dark:text-white"
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

                {/* Replace imageOfCertificate text input with file input */}
                <label className="text-sm font-semibold dark:text-white">Image of Certificate</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />

                {/* Date */}
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
                    <p><strong>Message:</strong> {successMsg}</p>
                    <p><strong>Certificate Hash:</strong> {issuedCertificate.certHash}</p>
                    <p><strong>Transaction Hash:</strong> {blockchainData?.txHash}</p>
                </div>
            )}
        </div>
    );
};

export default InstitutionCertificate;
