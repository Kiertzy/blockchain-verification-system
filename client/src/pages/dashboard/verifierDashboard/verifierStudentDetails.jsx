import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Form, Input, Select, Button, message, Col, Row } from "antd";
import { getUserById, clearUserState, updateUserDetails, clearUpdateState } from "../../../store/slices/userSlice";
import { getAllColleges } from "../../../store/slices/collegeSlice";
import { getAllCourses } from "../../../store/slices/courseSlice";
import { getAllMajors } from "../../../store/slices/majorSlice";

const { Option } = Select;

const VerifierStudentDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { colleges } = useSelector((state) => state.college);
    const { courses } = useSelector((state) => state.course);
    const { majors } = useSelector((state) => state.major);

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
        dispatch(getAllColleges());
        dispatch(getAllCourses());
        dispatch(getAllMajors());
    }, [dispatch]);

    useEffect(() => {
        if (selectedUser) {
            form.setFieldsValue({
                firstName: selectedUser.firstName,
                middleName: selectedUser.middleName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                sex: selectedUser.sex,
                studentId: selectedUser.studentId,
                college: selectedUser.college,
                department: selectedUser.department,
                major: selectedUser.major,
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
    if (!selectedUser) return <div className="p-6 text-gray-500 dark:text-gray-400">No student found.</div>;

    return (
        <div className="flex flex-col gap-y-8">
            {/* Page Title */}
            {/* <div className="flex items-center justify-between">
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
            </div> */}

            {/* User Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b px-6 py-4 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Student ID</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.studentId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}
                        </p>
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
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">College</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.college || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Department</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.department || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Major</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.major || "—"}</p>
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
                    {selectedUser.certIssued && selectedUser.certIssued.length > 0 ? (
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
                                        Issued Date
                                    </th>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Certificate Status
                                    </th>
                                    <th className="border-b px-4 py-2 text-left font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedUser.certIssued.map((cert, index) => (
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
                                            {cert.dateIssued ? new Date(cert.dateIssued).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="border-b px-4 py-2 dark:border-slate-700">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                    cert.certStatus === "CONFIRMED"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                                        : cert.certStatus === "REVOKED"
                                                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                                                }`}
                                            >
                                                {cert.certStatus}
                                            </span>
                                        </td>

                                        <td className="border-b px-4 py-2 dark:border-slate-700">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow hover:bg-blue-600"
                                                    onClick={() => {
                                                        navigate(`/certificates/verifier/student/certificate/${cert._id}`);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </div>
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
                                name="college"
                                label="College"
                            >
                                <Select placeholder="Select College">
                                    {colleges.map((college) => (
                                        <Option
                                            key={college._id}
                                            value={college.collegeName}
                                        >
                                            {college.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="department"
                                label="Department"
                            >
                                <Select placeholder="Select Department">
                                    {courses.map((department) => (
                                        <Option
                                            key={department._id}
                                            value={department.courseName}
                                        >
                                            {department.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="major"
                                label="Major"
                            >
                                <Select placeholder="Select Major">
                                    {majors.map((major) => (
                                        <Option
                                            key={major._id}
                                            value={major.majorName}
                                        >
                                            {major.name}
                                        </Option>
                                    ))}
                                </Select>
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

export default VerifierStudentDetails;
