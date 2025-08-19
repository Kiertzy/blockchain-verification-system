import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Form, Input, Select, Button, message, Col, Row } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, clearUserState, updateUserDetails, clearUpdateState } from "../../../store/slices/userSlice";

const { Option } = Select;

const AdminInstitutionDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedUser, loading, error, updateLoading, updateError, updateMessage } = useSelector((state) => state.users);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            dispatch(getUserById(id));
        }
        return () => {
            dispatch(clearUserState());
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (selectedUser) {
            form.setFieldsValue({
                firstName: selectedUser.firstName,
                middleName: selectedUser.middleName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                sex: selectedUser.sex,
                institutionName: selectedUser.institutionName,
                institutionPosition: selectedUser.institutionPosition,
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
                        student.middleName || "",
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
                        new Date(cert.dateIssued).toLocaleString(),
                        cert.certStatus,
                        issuer.firstName + " " + issuer.lastName,
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
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
                title="Update Student Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateUser}
                >
                    <Row gutter={16}>
                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[{ required: true, message: "First Name is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="middleName"
                                label="Middle Name"
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[{ required: true, message: "Last Name is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, type: "email", message: "Valid Email is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                        >
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

                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="studentId"
                                label="Student ID"
                                rules={[{ required: true, message: "Student ID is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        
                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="accountStatus"
                                label="Account Status"
                            >
                                <Select>
                                    <Option value="APPROVED">APPROVED</Option>
                                    <Option value="PENDING">PENDING</Option>
                                    <Option value="DISAPPROVED">DISAPPROVED</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Col>
                        <Form.Item
                            name="walletAddress"
                            label="Wallet Address"
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={updateLoading}
                        >
                            Update
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminInstitutionDetails;
