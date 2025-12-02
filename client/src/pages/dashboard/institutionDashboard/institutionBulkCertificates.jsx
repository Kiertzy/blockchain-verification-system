import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { bulkIssueCertificate, clearBulkIssueCertificateState } from "../../../store/slices/bulkIssueCertificate";
import { getAllUsers } from "../../../store/slices/userSlice";
import { getAllCertificateTemplates } from "../../../store/slices/certificateTemplateSlice";
import axios from "axios";

const CLOUD_NAME = "dgvkdyhcc";
const UPLOAD_PRESET = "student_certificates";

const InstitutionBulkCertificates = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { templates } = useSelector((state) => state.certificateTemplate);
  const { loading, error, message: successMsg, results, blockchainData } = useSelector((state) => state.bulkIssueCertificate);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textSettings, setTextSettings] = useState({
    fontSize: 60,
    fontFamily: 'Arial',
    color: '#000000',
    yPosition: 50,
  });

  const [formData, setFormData] = useState({
    nameOfInstitution: "",
    nameOfCertificate: "",
    college: "",
    course: "",
    major: "",
    certStatus: "ACTIVE",
    walletAddressInstitution: "",
    dateIssued: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllCertificateTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (successMsg && results) {
      message.success(`Successfully issued ${results.length} certificate(s)!`);
    }
  }, [successMsg, results]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Auto-fill institution data
  useEffect(() => {
    if (currentUser && currentUser.role === "INSTITUTION") {
      setFormData((prev) => ({
        ...prev,
        nameOfInstitution: currentUser.institutionName || "",
        walletAddressInstitution: currentUser.walletAddress || "",
      }));
    }
  }, [currentUser]);

  // Get institution's access permissions
  const getInstitutionAccess = () => {
    let collegeAccess = currentUser?.institutionCollegeAccess || [];
    let departmentAccess = currentUser?.institutionDepartmentAccess || [];
    let majorAccess = currentUser?.institutionMajorAccess || [];

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

  // Filter students based on institution access permissions
  const filteredUsers = users
    ?.filter((user) => {
      if (user.accountStatus?.toUpperCase() !== "APPROVED" || user.role?.toUpperCase() !== "STUDENT") {
        return false;
      }

      const access = getInstitutionAccess();
      const hasCollegeAccess = access.colleges.length === 0 || access.colleges.includes(user.college);
      const hasDepartmentAccess = access.departments.length === 0 || access.departments.includes(user.department);
      const hasMajorAccess = access.majors.length === 0 || access.majors.includes(user.major);

      return hasCollegeAccess && hasDepartmentAccess && hasMajorAccess;
    })
    ?.filter((user) => {
      const fullName = `${user.firstName} ${user.middleName || ""} ${user.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || user.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    ?.filter((user) => !selectedStudents.some(s => s._id === user._id));

  // Check if student already has this certificate
  const checkDuplicate = (certName, student) => {
    if (!certName || !student?.certIssued) return false;
    return student.certIssued.some(
      (cert) => cert.issuedBy?._id === currentUser._id && cert.nameOfCertificate?.toLowerCase() === certName.toLowerCase()
    );
  };

  const handleStudentSelect = (student) => {
    // Check for duplicate
    if (formData.nameOfCertificate && checkDuplicate(formData.nameOfCertificate, student)) {
      message.warning(`Certificate already issued to ${student.firstName} ${student.lastName}`);
      return;
    }

    setSelectedStudents([...selectedStudents, student]);
    setSearchQuery("");

    // Auto-fill common fields from first student
    if (selectedStudents.length === 0) {
      setFormData((prev) => ({
        ...prev,
        college: student.college || "",
        course: student.department || "",
        major: student.major || "",
      }));
    }
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s._id !== studentId));
  };

  // Handle template selection
  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    
    if (!templateId) {
      setSelectedTemplate(null);
      setFormData((prev) => ({
        ...prev,
        nameOfCertificate: "",
      }));
      setPreviewUrl(null);
      return;
    }

    const template = templates.find((t) => t._id === templateId);
    
    if (template) {
      setSelectedTemplate(template);
      setFormData((prev) => ({
        ...prev,
        nameOfCertificate: template.nameOfCertificateTemplate,
      }));
      setPreviewUrl(template.imageOfCertificateTemplate);

      // Check duplicates for all selected students
      const duplicates = selectedStudents.filter(student => 
        checkDuplicate(template.nameOfCertificateTemplate, student)
      );
      
      if (duplicates.length > 0) {
        message.warning(`Certificate already issued to: ${duplicates.map(s => s.firstName + ' ' + s.lastName).join(', ')}`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (error || successMsg) {
      dispatch(clearBulkIssueCertificateState());
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check duplicates if certificate name changed
    if (name === "nameOfCertificate" && value) {
      const duplicates = selectedStudents.filter(student => 
        checkDuplicate(value, student)
      );
      
      if (duplicates.length > 0) {
        message.warning(`Certificate already issued to: ${duplicates.map(s => s.firstName + ' ' + s.lastName).join(', ')}`);
      }
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
  const addTextToCertificate = async (studentName) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.font = `bold ${textSettings.fontSize}px ${textSettings.fontFamily}`;
        ctx.fillStyle = textSettings.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const yPos = (canvas.height * textSettings.yPosition) / 100;
        ctx.fillText(studentName, canvas.width / 2, yPos);

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

      img.crossOrigin = "anonymous";
      img.src = previewUrl;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      message.error("Please select at least one student");
      return;
    }

    if (!formData.nameOfCertificate) {
      message.error("Please enter certificate name or select a template");
      return;
    }

    if (!previewUrl) {
      message.error("Please select a certificate template");
      return;
    }

    // Check for duplicates
    const duplicates = selectedStudents.filter(student => 
      checkDuplicate(formData.nameOfCertificate, student)
    );
    
    if (duplicates.length > 0) {
      message.error(`Cannot proceed: Certificate already issued to ${duplicates.length} student(s)`);
      return;
    }

    try {
      message.loading("Processing certificates...", 0);

      // Process each student's certificate
      const studentsData = [];
      
      for (const student of selectedStudents) {
        const studentName = `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim();
        
        // Add student name to certificate
        const blob = await addTextToCertificate(studentName);

        // Upload to Cloudinary
        const formDataCloud = new FormData();
        formDataCloud.append("file", blob, `certificate-${student._id}.png`);
        formDataCloud.append("upload_preset", UPLOAD_PRESET);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          formDataCloud
        );

        studentsData.push({
          name: studentName,
          walletAddress: student.walletAddress,
          imageOfCertificate: res.data.secure_url,
        });
      }

      message.destroy();

      // Prepare bulk payload
      const bulkPayload = {
        nameOfInstitution: formData.nameOfInstitution,
        nameOfCertificate: formData.nameOfCertificate,
        college: formData.college,
        course: formData.course,
        major: formData.major,
        certStatus: formData.certStatus,
        walletAddressInstitution: formData.walletAddressInstitution,
        dateIssued: formData.dateIssued,
        students: studentsData,
      };

      dispatch(bulkIssueCertificate(bulkPayload));

      // Reset form
      setSelectedStudents([]);
      setSelectedTemplate(null);
      setPreviewUrl(null);

    } catch (error) {
      message.destroy();
      message.error("Failed to process certificates");
      console.error(error);
    }
  };

  // Render access info
  const renderAccessInfo = () => {
    const access = getInstitutionAccess();
    
    if (access.colleges.length === 0 && access.departments.length === 0 && access.majors.length === 0) {
      return (
        <div className="w-full max-w-4xl rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ No access restrictions set. You can issue certificates to all students.
          </p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bulk Issue Certificates</h1>

      {/* Access Permissions */}
      {renderAccessInfo()}

      {/* Student Search */}
      <div className="w-full max-w-4xl">
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Search and Select Students
        </label>
        <input
          type="text"
          placeholder="Search student by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        
        {searchQuery && (
          <div className="mt-2 max-h-60 overflow-auto rounded-md border border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800">
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
                    {student.studentId} • {student.college} • {student.department} • {student.major}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-slate-500 dark:text-slate-400">
                No matching students with your access permissions
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Students */}
      {selectedStudents.length > 0 && (
        <div className="w-full max-w-4xl rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white">
              Selected Students ({selectedStudents.length})
            </h2>
            <button
              type="button"
              onClick={() => setSelectedStudents([])}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedStudents.map((student) => (
              <div
                key={student._id}
                className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                <span>
                  {student.firstName} {student.lastName}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveStudent(student._id)}
                  className="ml-1 text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
        <div className="grid grid-cols-2 gap-4">
          {/* Institution Name */}
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Institution Name
            </label>
            <input
              type="text"
              name="nameOfInstitution"
              value={formData.nameOfInstitution}
              onChange={handleChange}
              disabled
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Template Selection */}
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select Certificate Template
            </label>
            <select
              onChange={handleTemplateSelect}
              value={selectedTemplate?._id || ""}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">-- Select Template --</option>
              {templates?.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.nameOfCertificateTemplate}
                </option>
              ))}
            </select>
          </div>

          {/* Certificate Name */}
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Certificate Name
            </label>
            <input
              type="text"
              name="nameOfCertificate"
              value={formData.nameOfCertificate}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          {/* College */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              College
            </label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          {/* Course */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Course
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          {/* Major */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Major
            </label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          {/* Certificate Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Certificate Status
            </label>
            <select
              name="certStatus"
              value={formData.certStatus}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="REVOKED">REVOKED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          {/* Institution Wallet */}
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Institution Wallet Address
            </label>
            <input
              type="text"
              name="walletAddressInstitution"
              value={formData.walletAddressInstitution}
              onChange={handleChange}
              disabled
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Date Issued */}
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date Issued
            </label>
            <input
              type="date"
              name="dateIssued"
              value={formData.dateIssued}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          {/* Text Customization */}
          {previewUrl && selectedStudents.length > 0 && (
            <>
              <div className="col-span-2">
                <h3 className="mb-2 font-semibold text-slate-800 dark:text-white">
                  Customize Student Name Position
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
                  Preview (Sample with first student)
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
                    {selectedStudents[0] ? 
                      `${selectedStudents[0].firstName} ${selectedStudents[0].middleName || ""} ${selectedStudents[0].lastName}`.trim() 
                      : "Student Name"}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading || selectedStudents.length === 0}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "Issuing Certificates..."
                : `Issue ${selectedStudents.length} Certificate${selectedStudents.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </form>

      {/* Success Message */}
      {successMsg && results && (
        <div className="w-full max-w-4xl rounded-lg border border-green-500 bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-300">
          <h2 className="mb-2 text-lg font-semibold">Certificates Issued Successfully ✅</h2>
          <p className="mb-2">
            <strong>Total Issued:</strong> {results.length} certificate(s)
          </p>
          {blockchainData?.txHash && (
            <p className="mb-2">
              <strong>Blockchain Transaction:</strong>{" "}
              <a
                href={`https://etherscan.io/tx/${blockchainData.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {blockchainData.txHash}
              </a>
            </p>
          )}
          
          <div className="mt-4 max-h-60 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-100 dark:bg-green-800">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Student Name</th>
                  <th className="px-3 py-2 text-left">Wallet</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((cert, index) => (
                  <tr key={index} className="border-t border-green-200 dark:border-green-700">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">{cert.nameOfStudent}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {cert.walletAddressStudent?.substring(0, 10)}...
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        PENDING
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-4xl rounded-lg border border-red-500 bg-red-100 px-4 py-3 text-red-700 dark:bg-red-800 dark:text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default InstitutionBulkCertificates;
