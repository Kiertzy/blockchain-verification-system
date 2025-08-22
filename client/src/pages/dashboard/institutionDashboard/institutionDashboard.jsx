import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Form, Input, Row, Col, Select, Modal, message } from "antd";
import { Users, BookOpen, GraduationCap, School, FileText } from "lucide-react";
import { updateUserDetails, clearUpdateState, getUserById } from "../../../store/slices/userSlice";

import { getAllMajors } from "../../../store/slices/majorSlice";
import { getAllCourses } from "../../../store/slices/courseSlice";
import { getAllColleges } from "../../../store/slices/collegeSlice";

const { Option } = Select;

const InstitutionDashboard = () => {
    const dispatch = useDispatch();

    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { colleges } = useSelector((state) => state.college);
    const { courses } = useSelector((state) => state.course);
    const { majors } = useSelector((state) => state.major);

    const { selectedUser, updateMessage, updateError, updateLoading } = useSelector((state) => state.users);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const id = loggedInUser?._id;

    // ✅ Certificates issued by this institution (from selectedUser)
    const institutionCertificates = selectedUser?.certificateIssued || [];

    const studentsWithCertificates = new Set(
        institutionCertificates
            .filter((cert) => {
                const issuedById =
                    typeof cert.issuedBy === "object" && cert.issuedBy !== null ? cert.issuedBy._id?.toString?.() : cert.issuedBy?.toString?.();

                return issuedById === loggedInUser._id.toString();
            })
            .map((cert) => (typeof cert.issuedTo === "object" && cert.issuedTo !== null ? cert.issuedTo._id?.toString() : cert.issuedTo?.toString())),
    );

    const totalStudentsWithCertificates = studentsWithCertificates.size;

    // ✅ Total certificates issued
    const totalCertificatesIssued = institutionCertificates.length;

    // ✅ Group students by certificate name
    const certificatesByName = institutionCertificates.reduce((acc, cert) => {
        if (!acc[cert.nameOfCertificate]) {
            acc[cert.nameOfCertificate] = new Set();
        }
        acc[cert.nameOfCertificate].add(cert.issuedTo);
        return acc;
    }, {});

    // Fetch data on mount
    useEffect(() => {
        dispatch(getAllColleges());
        dispatch(getAllCourses());
        dispatch(getAllMajors());
    }, [dispatch]);

    // Fetch user details when component mounts
    useEffect(() => {
        if (id) {
            dispatch(getUserById(id));
        }
    }, [id, dispatch]);

    // Prefill form when modal opens
    useEffect(() => {
        if (isModalOpen && selectedUser) {
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
    }, [isModalOpen, selectedUser, form]);

    // Handle update messages
    useEffect(() => {
        if (updateMessage) {
            message.success(updateMessage);
            setIsModalOpen(false);
            dispatch(clearUpdateState());
            if (id) dispatch(getUserById(id));
        }
        if (updateError) {
            message.error(updateError);
            dispatch(clearUpdateState());
        }
    }, [updateMessage, updateError, dispatch, id]);

    const handleUpdateUser = (values) => {
        if (id) {
            dispatch(updateUserDetails({ userId: id, userData: values }));
        }
    };

    if (!selectedUser) {
        return <div className="p-6 text-gray-500 dark:text-gray-400">No user details found.</div>;
    }

    return (
        <div className="flex flex-col gap-y-4">
            {/* Stats Grid */}
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Students */}
                <div className="card">
                    <div className="card-header">
                        <Users
                            className="text-pink-600"
                            size={28}
                        />
                        <p className="card-title">Students</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{totalStudentsWithCertificates}</p>
                    </div>
                </div>

                {/* Colleges */}
                <div className="card">
                    <div className="card-header">
                        <School
                            className="text-blue-600"
                            size={28}
                        />
                        <p className="card-title">Colleges</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{colleges?.length || 0}</p>
                    </div>
                </div>

                {/* Courses */}
                <div className="card">
                    <div className="card-header">
                        <BookOpen
                            className="text-indigo-600"
                            size={28}
                        />
                        <p className="card-title">Courses</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{courses?.length || 0}</p>
                    </div>
                </div>

                {/* Majors */}
                <div className="card">
                    <div className="card-header">
                        <GraduationCap
                            className="text-purple-600"
                            size={28}
                        />
                        <p className="card-title">Majors</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{majors?.length || 0}</p>
                    </div>
                </div>

                {/* Certificates */}
                <div className="card">
                    <div className="card-header">
                        <FileText
                            className="text-red-600"
                            size={28}
                        />
                        <p className="card-title">Certificates</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{totalCertificatesIssued}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <FileText
                            className="text-red-600"
                            size={28}
                        />
                        <p className="card-title">Students with Certificates (by Name)</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        {Object.entries(certificatesByName).map(([name, students]) => (
                            <div
                                key={name}
                                className="flex justify-between"
                            >
                                <span className="font-medium">{name}</span>
                                <span className="text-lg font-bold">{students.size}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedUser.institutionName} Profile</h1>
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
                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.institutionPosition || "—"}</p>
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

            {/* Modal for updating user */}
            <Modal
                title="Update Institution Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateUser}
                >
                    <Form.Item
                        name="institutionName"
                        label="Institution Name"
                        rules={[{ required: true, message: "Institution Name is required" }]}
                    >
                        <Input />
                    </Form.Item>

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
                                name="institutionPosition"
                                label="Institution Position"
                                rules={[{ required: true, message: "Position is required" }]}
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

                        <Col
                            xs={24}
                            sm={12}
                        >
                            <Form.Item
                                name="accreditationInfo"
                                label="Accreditation Info"
                                rules={[{ required: true, message: "Accreditation Info is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="walletAddress"
                        label="Wallet Address"
                    >
                        <Input disabled />
                    </Form.Item>

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

export default InstitutionDashboard;
