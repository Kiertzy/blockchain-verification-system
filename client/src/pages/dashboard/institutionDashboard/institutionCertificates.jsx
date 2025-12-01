import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { issueCertificate, clearIssueCertificateState } from "../../../store/slices/issueCertificateSlice";
import { getAllUsers } from "../../../store/slices/userSlice";
import { getAllCertificateTemplates } from "../../../store/slices/certificateTemplateSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CLOUD_NAME = "dgvkdyhcc";
const UPLOAD_PRESET = "student_certificates";

const InstitutionCertificate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.users);
    const { templates } = useSelector((state) => state.certificateTemplate);
    const { loading, error, message: successMsg, issuedCertificate, blockchainData } = useSelector((state) => state.issueCertificate);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [textSettings, setTextSettings] = useState({
        fontSize: 60,
        fontFamily: 'Arial',
        color: '#000000',
        yPosition: 50, // percentage from top
    });

    useEffect(() => {
        dispatch(getAllUsers());
        dispatch(getAllCertificateTemplates());
    }, [dispatch]);

    useEffect(() => {
        if (successMsg && issuedCertificate) {
            message.success("Certificate issued successfully!");
        }
    }, [successMsg, issuedCertificate]);

    // ✅ Get institution's access permissions
    const getInstitutionAccess = () => {
        let collegeAccess = currentUser?.institutionCollegeAccess || [];
        let departmentAccess = currentUser?.institutionDepartmentAccess || [];
        let majorAccess = currentUser?.institutionMajorAccess || [];

        // Parse if they're strings
        if (typeof collegeAccess === 'string') {
            try {
                collegeAccess = JSON.parse(collegeAccess);
            } catch (e) {
                collegeAccess = [];
            }
        }

        if (typeof departmentAccess === 'string') {
            try {
                departmentAccess = JSON.parse(departmentAccess);
            } catch (e) {
                departmentAccess = [];
            }
        }

        if (typeof majorAccess === 'string') {
            try {
                majorAccess = JSON.parse(majorAccess);
            } catch (e) {
                majorAccess = [];
            }
        }

        return {
            colleges: Array.isArray(collegeAccess) ? collegeAccess : [],
            departments: Array.isArray(departmentAccess) ? departmentAccess : [],
            majors: Array.isArray(majorAccess) ? majorAccess : [],
        };
    };

    // ✅ Filter students based on institution access permissions
    const filteredUsers = users
        ?.filter((user) => {
            // Must be approved student
            if (user.accountStatus?.toUpperCase() !== "APPROVED" || user.role?.toUpperCase() !== "STUDENT") {
                return false;
            }

            const access = getInstitutionAccess();

            // Check if institution has access to student's college, department, and major
            const hasCollegeAccess = access.colleges.length === 0 || access.colleges.includes(user.college);
            const hasDepartmentAccess = access.departments.length === 0 || access.departments.includes(user.department);
            const hasMajorAccess = access.majors.length === 0 || access.majors.includes(user.major);

            // Student must match ALL access criteria
            return hasCollegeAccess && hasDepartmentAccess && hasMajorAccess;
        })
        ?.filter((user) => {
            // Then filter by search query
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

    // Handle template selection
    const handleTemplateSelect = (e) => {
        const templateId = e.target.value;
        
        if (!templateId) {
            // Reset if "Select Template" is chosen
            setSelectedTemplate(null);
            setFormData((prev) => ({
                ...prev,
                nameOfCertificate: "",
            }));
            setPreviewUrl(null);
            setSelectedImageFile(null);
            return;
        }

        const template = templates.find((t) => t._id === templateId);
        
        if (template) {
            setSelectedTemplate(template);
            setFormData((prev) => ({
                ...prev,
                nameOfCertificate: template.nameOfCertificateTemplate,
            }));
            
            // Set preview URL from template
            setPreviewUrl(template.imageOfCertificateTemplate);
            
            // Check for duplicates
            if (selectedStudent) {
                const duplicate = checkDuplicate(template.nameOfCertificateTemplate, selectedStudent);
                setIsDuplicate(duplicate);
                if (duplicate) {
                    message.warning("This certificate has already been issued to the student.");
                }
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let formattedValue = value;

        if (name === "nameOfCertificate") {
            formattedValue = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

            if (selectedStudent) {
                const duplicate = checkDuplicate(formattedValue, selectedStudent);
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
            setPreviewUrl(URL.createObjectURL(file));
            setSelectedTemplate(null); // Clear template selection if custom image is uploaded
        }
    };

    const handleTextSettingsChange = (e) => {
        const { name, value } = e.target;
        setTextSettings((prev) => ({
            ...prev,
            [name]: name === 'fontSize' || name === 'yPosition' ? parseInt(value) : value,
        }));
    };

    // Function to add student name to certificate image
    const addTextToCertificate = async () => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Set canvas size to match image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the certificate image
                ctx.drawImage(img, 0, 0);

                // Configure text style
                ctx.font = `bold ${textSettings.fontSize}px ${textSettings.fontFamily}`;
                ctx.fillStyle = textSettings.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Add shadow for better readability
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Calculate Y position based on percentage
                const yPos = (canvas.height * textSettings.yPosition) / 100;

                // Draw student name
                ctx.fillText(formData.nameOfStudent, canvas.width / 2, yPos);

                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                }, 'image/png', 1.0);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.crossOrigin = "anonymous"; // Handle CORS for external images
            img.src = previewUrl;
        });
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

        if (!previewUrl) {
            message.error("Please select a certificate template or upload an image");
            return;
        }

        try {
            message.loading("Processing certificate image...", 0);

            // Add student name to certificate image
            const blob = await addTextToCertificate();

            // Upload to Cloudinary
            const formDataCloud = new FormData();
            formDataCloud.append("file", blob, 'certificate.png');
            formDataCloud.append("upload_preset", UPLOAD_PRESET);

            const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formDataCloud);

            message.destroy();

            const cloudinaryUrl = res.data.secure_url;

            const finalFormData = {
                ...formData,
                imageOfCertificate: cloudinaryUrl,
                ipfsCID: res.data.public_id,
            };

            dispatch(issueCertificate(finalFormData));

            // Cleanup
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setSelectedImageFile(null);
            setSelectedTemplate(null);

        } catch (error) {
            message.destroy();
            message.error("Failed to process and upload certificate image");
            console.error(error);
        }
    };

    // ✅ Show access restrictions info
    const renderAccessInfo = () => {
        const access = getInstitutionAccess();
        
        if (access.colleges.length === 0 && access.departments.length === 0 && access.majors.length === 0) {
            return (
                <div className="w-full max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ No access restrictions set. You can issue certificates to all students.
                    </p>
                </div>
            );
        }

        return (
            <div className="w-full max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                <p className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
                    📋 Your Access Permissions:
                </p>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    {access.colleges.length > 0 && (
                        <p><strong>Colleges:</strong> {access.colleges.join(", ")}</p>
                    )}
                    {access.departments.length > 0 && (
                        <p><strong>Departments:</strong> {access.departments.join(", ")}</p>
                    )}
                    {access.majors.length > 0 && (
                        <p><strong>Majors:</strong> {access.majors.join(", ")}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Issue Student Certificate</h1>

            {/* ✅ Show access permissions */}
            {renderAccessInfo()}

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
                                <div className="font-medium">
                                    {student.firstName} {student.middleName} {student.lastName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {student.college} • {student.department} • {student.major}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-slate-500 dark:text-slate-400">
                            {searchQuery ? "No matching students with your access permissions" : "No matching students"}
                        </div>
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
                                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    ))}

                    {/* Certificate Template Dropdown */}
                    <div className="col-span-2">
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select Certificate Template
                        </label>
                        <select
                            onChange={handleTemplateSelect}
                            value={selectedTemplate?._id || ""}
                            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">-- Select Template (or upload custom) --</option>
                            {templates?.map((template) => (
                                <option key={template._id} value={template._id}>
                                    {template.nameOfCertificateTemplate}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Certificate Name (Auto-filled from template or manual) */}
                    <div className="col-span-2">
                        <label
                            htmlFor="nameOfCertificate"
                            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Certificate Name
                        </label>
                        <input
                            id="nameOfCertificate"
                            type="text"
                            name="nameOfCertificate"
                            placeholder="Certificate Name"
                            value={formData.nameOfCertificate}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-4 py-2 text-sm ${
                                isDuplicate ? "border-red-500" : "border-slate-300"
                            } dark:border-slate-600 dark:bg-slate-800 dark:text-white`}
                        />
                    </div>

                    {/* Text Customization Controls */}
                    {previewUrl && formData.nameOfStudent && (
                        <>
                            <div className="col-span-2">
                                <h3 className="mb-2 font-semibold text-slate-800 dark:text-white">
                                    Customize Student Name on Certificate
                                </h3>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Font Size
                                </label>
                                <input
                                    type="number"
                                    name="fontSize"
                                    value={textSettings.fontSize}
                                    onChange={handleTextSettingsChange}
                                    min="20"
                                    max="200"
                                    className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Font Family
                                </label>
                                <select
                                    name="fontFamily"
                                    value={textSettings.fontFamily}
                                    onChange={handleTextSettingsChange}
                                    className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Text Color
                                </label>
                                <input
                                    type="color"
                                    name="color"
                                    value={textSettings.color}
                                    onChange={handleTextSettingsChange}
                                    className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-600"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Vertical Position (%)
                                </label>
                                <input
                                    type="range"
                                    name="yPosition"
                                    value={textSettings.yPosition}
                                    onChange={handleTextSettingsChange}
                                    min="10"
                                    max="90"
                                    className="w-full"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                    {textSettings.yPosition}%
                                </span>
                            </div>

                            {/* Preview */}
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-semibold dark:text-white">
                                    Preview
                                </label>
                                <div className="relative overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
                                    <img
                                        src={previewUrl}
                                        alt="Certificate Preview"
                                        className="w-full"
                                    />
                                    <div
                                        className="pointer-events-none absolute left-0 right-0 text-center"
                                        style={{
                                            top: `${textSettings.yPosition}%`,
                                            transform: 'translateY(-50%)',
                                            fontSize: `${textSettings.fontSize * 0.5}px`,
                                            fontFamily: textSettings.fontFamily,
                                            color: textSettings.color,
                                            fontWeight: 'bold',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {formData.nameOfStudent}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

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

