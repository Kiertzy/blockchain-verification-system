import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Form, Input, Select, Button, message, Col, Row } from "antd";
import { useParams } from "react-router-dom";
import { getUserById, clearUserState, updateUserDetails, clearUpdateState } from "../../../store/slices/userSlice";
import { getAllCourses } from "../../../store/slices/courseSlice";
import { getAllColleges } from "../../../store/slices/collegeSlice";
import { getAllMajors } from "../../../store/slices/majorSlice";

const { Option } = Select;

const AdminInstitutionDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedUser, loading, error, updateLoading, updateError, updateMessage } = useSelector((state) => state.users);
    const { courses } = useSelector((state) => state.course);
    const { colleges } = useSelector((state) => state.college);
    const { majors } = useSelector((state) => state.major);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            dispatch(getUserById(id));
        }
        dispatch(getAllCourses());
        dispatch(getAllColleges());
        dispatch(getAllMajors());
        return () => {
            dispatch(clearUserState());
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (selectedUser) {
            // Parse institutionDepartmentAccess if it's a string
            let departmentAccess = selectedUser.institutionDepartmentAccess;
            if (typeof departmentAccess === 'string') {
                try {
                    departmentAccess = JSON.parse(departmentAccess);
                } catch (e) {
                    departmentAccess = [];
                }
            }

            // Parse institutionCollegeAccess if it's a string
            let collegeAccess = selectedUser.institutionCollegeAccess;
            if (typeof collegeAccess === 'string') {
                try {
                    collegeAccess = JSON.parse(collegeAccess);
                } catch (e) {
                    collegeAccess = [];
                }
            }

            // Parse institutionMajorAccess if it's a string
            let majorAccess = selectedUser.institutionMajorAccess;
            if (typeof majorAccess === 'string') {
                try {
                    majorAccess = JSON.parse(majorAccess);
                } catch (e) {
                    majorAccess = [];
                }
            }

            form.setFieldsValue({
                firstName: selectedUser.firstName,
                middleName: selectedUser.middleName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                sex: selectedUser.sex,
                institutionName: selectedUser.institutionName,
                institutionPosition: selectedUser.institutionPosition,
                institutionCollegeAccess: Array.isArray(collegeAccess) ? collegeAccess : [],
                institutionMajorAccess: Array.isArray(majorAccess) ? majorAccess : [],
                institutionDepartmentAccess: Array.isArray(departmentAccess) ? departmentAccess : [],
                accreditationInfo: selectedUser.accreditationInfo,
                walletAddress: selectedUser.walletAddress,
                accountStatus: selectedUser.accountStatus,
            });
        }
    }, [selectedUser, form]);

    useEffect(() => {
        if (updateMessage) {
            message.success(updateMessage);
            setIsModalOpen(false);
            dispatch(clearUpdateState());
            dispatch(getUserById(id));
        }
        if (updateError) {
            message.error(updateError);
            dispatch(clearUpdateState());
        }
    }, [updateMessage, updateError, dispatch, id]);

    const handleUpdateUser = (values) => {
        dispatch(updateUserDetails({ userId: id, userData: values }));
    };

    if (loading) return <div className="p-6 text-slate-700 dark:text-slate-200">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!selectedUser) return <div className="p-6 text-gray-500 dark:text-gray-400">No institution found.</div>;

    const certificates = selectedUser.certificateIssued || [];

    // Helper function to count number of students per certificate name
    const countByCertificateName = (name) => {
        return certificates.filter((cert) => cert.nameOfCertificate === name).length;
    };

    // Helper function to export CSV
    const exportStudentsCSV = (certificateName) => {
        const students = certificates.filter((cert) => cert.nameOfCertificate === certificateName).map((cert) => cert.issuedTo || []);

        if (students.length === 0) {
            alert("No students found for this certificate.");
            return;
        }

        const csvHeader = [
            "Student ID",
            "First Name",
            "Middle Name",
            "Last Name",
            "Email",
            "College",
            "Department",
            "Major",
            "Certificate Name",
            "Institution Name",
            "Image URL",
            "Certificate Hash",
            "Transaction Hash",
            "Wallet Address Student",
            "Wallet Address Institution",
            "Date Issued",
            "Certificate Status",
            "Issued By Name",
            "Issued By Email",
        ];

        const csvRows = students
            .map((student) => {
                // Find all certificates this student has with this name
                const certs = certificates.filter((c) => c.nameOfCertificate === certificateName && c.issuedTo._id === student._id);

                return certs.map((cert) => {
                    const issuer = cert.issuedBy;
                    return [
                        student.studentId,
                        student.firstName,
                        student.middleName,
                        student.lastName,
                        student.email,
                        student.college,
                        student.department,
                        student.major,
                        cert.nameOfCertificate,
                        cert.nameOfInstitution,
                        cert.imageOfCertificate,
                        cert.certHash,
                        cert.txHash,
                        cert.walletAddressStudent,
                        cert.walletAddressInstitution,
                        cert.dateIssued,
                        cert.certStatus,
                        issuer.firstName + " " + issuer.middleName + " " + issuer.lastName,
                        issuer.email,
                    ];
                });
            })
            .flat();

        const csvContent = [csvHeader, ...csvRows].map((e) => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${certificateName}_students.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Institution Profile</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Detailed information and issued certificates</p>
                </div>
                <Button
                    type="primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    Update User Details
                </Button>
            </div>

            {/* User Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b px-6 py-4 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Position</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.institutionPosition}</p>
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

                    {/* College Access Display */}
                    <div className="max-w-full">
                        <p className="text-sm text-slate-500 dark:text-slate-400">College Access</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                                let access = selectedUser.institutionCollegeAccess;
                                if (typeof access === 'string') {
                                    try {
                                        access = JSON.parse(access);
                                    } catch (e) {
                                        access = [];
                                    }
                                }
                                
                                if (Array.isArray(access) && access.length > 0) {
                                    return access.map((college, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                        >
                                            {college}
                                        </span>
                                    ));
                                }
                                return <span className="text-slate-500 dark:text-slate-400">No access granted</span>;
                            })()}
                        </div>
                    </div>

                    {/* Department Access Display */}
                    <div className="max-w-full">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Department Access</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                                let access = selectedUser.institutionDepartmentAccess;
                                if (typeof access === 'string') {
                                    try {
                                        access = JSON.parse(access);
                                    } catch (e) {
                                        access = [];
                                    }
                                }
                                
                                if (Array.isArray(access) && access.length > 0) {
                                    return access.map((dept, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                        >
                                            {dept}
                                        </span>
                                    ));
                                }
                                return <span className="text-slate-500 dark:text-slate-400">No access granted</span>;
                            })()}
                        </div>
                    </div>

                    {/* Major Access Display */}
                    <div className="max-w-full">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Major Access</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                                let access = selectedUser.institutionMajorAccess;
                                if (typeof access === 'string') {
                                    try {
                                        access = JSON.parse(access);
                                    } catch (e) {
                                        access = [];
                                    }
                                }
                                
                                if (Array.isArray(access) && access.length > 0) {
                                    return access.map((major, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                        >
                                            {major}
                                        </span>
                                    ));
                                }
                                return <span className="text-slate-500 dark:text-slate-400">No access granted</span>;
                            })()}
                        </div>
                    </div>

                    <div className="max-w-full">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Accreditation Info</p>
                        <p className="break-words font-medium text-slate-900 dark:text-white">{selectedUser.accreditationInfo || "—"}</p>
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
                    {selectedUser.certificateIssued && selectedUser.certificateIssued.length > 0 ? (
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
                                        No. of Certificate issued to Students
                                    </th>

                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Report
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedUser.certificateIssued.map((cert, index) => (
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
                                            {countByCertificateName(cert.nameOfCertificate)}
                                        </td>

                                        <td className="whitespace-nowrap border-b px-4 py-2 text-slate-800 dark:border-slate-700 dark:text-gray-200">
                                            <button
                                                onClick={() => exportStudentsCSV(cert.nameOfCertificate)}
                                                className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                            >
                                                Export
                                            </button>
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

            {/* Modal for updating user */}
            <Modal
                title="Update Institution Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateUser}
                >
                    <Col>
                        <Form.Item
                            name="institutionName"
                            label="Institution Name"
                            rules={[{ required: true, message: "Institution Name is required" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[{ required: true, message: "First Name is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item name="middleName" label="Middle Name">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[{ required: true, message: "Last Name is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, type: "email", message: "Valid Email is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="sex"
                                label="Sex"
                                rules={[{ required: true, message: "Sex is required" }]}
                            >
                                <Select>
                                    <Option value="Male">Male</Option>
                                    <Option value="Female">Female</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="institutionPosition"
                                label="Institution Position"
                                rules={[{ required: true, message: "Position is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item name="accountStatus" label="Account Status">
                                <Select>
                                    <Option value="APPROVED">APPROVED</Option>
                                    <Option value="PENDING">PENDING</Option>
                                    <Option value="DISAPPROVED">DISAPPROVED</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="accreditationInfo"
                                label="Accreditation Info"
                                rules={[{ required: true, message: "Accreditation Info is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ✅ Multi-select College Access */}
                    <Col>
                        <Form.Item 
                            name="institutionCollegeAccess" 
                            label="College Access"
                            help="Select which colleges this institution can access"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select colleges"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                maxTagCount="responsive"
                            >
                                {colleges?.map((college) => (
                                    <Option key={college._id} value={college.collegeName}>
                                        {college.collegeName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* ✅ Multi-select Department Access */}
                    <Col>
                        <Form.Item 
                            name="institutionDepartmentAccess" 
                            label="Department Access (Courses)"
                            help="Select which courses/departments this institution can access"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select departments/courses"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                maxTagCount="responsive"
                            >
                                {courses?.map((course) => (
                                    <Option key={course._id} value={course.courseName}>
                                        {course.courseName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* ✅ Multi-select Major Access */}
                    <Col>
                        <Form.Item 
                            name="institutionMajorAccess" 
                            label="Major Access"
                            help="Select which majors this institution can access"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select majors"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                maxTagCount="responsive"
                            >
                                {majors?.map((major) => (
                                    <Option key={major._id} value={major.majorName}>
                                        {major.majorName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col>
                        <Form.Item name="walletAddress" label="Wallet Address">
                            <Input disabled />
                        </Form.Item>
                    </Col>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={updateLoading}
                            block
                        >
                            Update Institution Details
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminInstitutionDetails;

