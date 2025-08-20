import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Form, Input, Select, Button, message, Col, Row } from "antd";
import { useParams } from "react-router-dom";
import { getUserById, clearUserState, updateUserDetails, clearUpdateState } from "../../../store/slices/userSlice";

const { Option } = Select;

const AdminDetails = () => {
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

    return (
        <div className="flex flex-col gap-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Profile</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Detailed information</p>
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">Wallet Address</p>
                        <p className="break-words font-medium text-slate-900 dark:text-white">{selectedUser.walletAddress || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Modal for updating user */}
            <Modal
                title="Update Admin Details"
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
                                rules={[{ required: true, message: "Middle Name is required" }]}
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

export default AdminDetails;
