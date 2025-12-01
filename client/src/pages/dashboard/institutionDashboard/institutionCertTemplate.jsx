import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import {
    createCertificateTemplate,
    getAllCertificateTemplates,
    deleteCertificateTemplate,
    clearCertificateTemplateMessage,
    clearCertificateTemplateError,
} from "../../../store/slices/certificateTemplateSlice";
import axios from "axios";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CLOUD_NAME = "dgvkdyhcc";
const UPLOAD_PRESET = "student_certificates";

const InstitutionCertTemplate = () => {
    const dispatch = useDispatch();
    const { templates, loading, error, message: successMsg } = useSelector(
        (state) => state.certificateTemplate
    );

    const [formData, setFormData] = useState({
        nameOfCertificateTemplate: "",
    });
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        dispatch(getAllCertificateTemplates());
    }, [dispatch]);

    useEffect(() => {
        if (successMsg) {
            message.success(successMsg);
            dispatch(clearCertificateTemplateMessage());
        }
    }, [successMsg, dispatch]);

    useEffect(() => {
        if (error) {
            message.error(error);
            dispatch(clearCertificateTemplateError());
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "application/pdf"];
            if (!validTypes.includes(file.type)) {
                message.error("Invalid file type. Please upload JPEG, JPG, PNG, GIF, or PDF");
                return;
            }

            setSelectedImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nameOfCertificateTemplate.trim()) {
            message.error("Please enter a certificate template name");
            return;
        }

        if (!selectedImageFile) {
            message.error("Please select an image file for the certificate template");
            return;
        }

        try {
            setUploading(true);
            message.loading("Uploading certificate template...", 0);

            // Upload to Cloudinary
            const formDataCloud = new FormData();
            formDataCloud.append("file", selectedImageFile);
            formDataCloud.append("upload_preset", UPLOAD_PRESET);

            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formDataCloud
            );

            message.destroy();

            const cloudinaryUrl = res.data.secure_url;

            // Get file extension from original filename
            const fileExtension = selectedImageFile.name.split(".").pop().toLowerCase();

            const templateData = {
                nameOfCertificateTemplate: formData.nameOfCertificateTemplate.trim(),
                imageOfCertificateTemplate: `${cloudinaryUrl}`,
            };

            // Ensure URL ends with extension for validation
            if (!templateData.imageOfCertificateTemplate.includes(`.${fileExtension}`)) {
                templateData.imageOfCertificateTemplate = `${cloudinaryUrl}.${fileExtension}`;
            }

            await dispatch(createCertificateTemplate(templateData)).unwrap();

            // Reset form
            setFormData({ nameOfCertificateTemplate: "" });
            setSelectedImageFile(null);
            setPreviewUrl(null);
            setShowForm(false);
            setUploading(false);

            // Cleanup
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        } catch (error) {
            message.destroy();
            setUploading(false);
            message.error(error || "Failed to create certificate template");
            console.error(error);
        }
    };

    const handleDelete = async (templateId) => {
        if (window.confirm("Are you sure you want to delete this certificate template?")) {
            try {
                await dispatch(deleteCertificateTemplate(templateId)).unwrap();
                message.success("Certificate template deleted successfully");
            } catch (error) {
                message.error(error || "Failed to delete certificate template");
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ nameOfCertificateTemplate: "" });
        setSelectedImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Certificate Templates
                </h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                    >
                        + Create New Template
                    </button>
                )}
            </div>

            {/* Create Template Form */}
            {showForm && (
                <div className="w-full max-w-2xl mx-auto rounded-lg border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Create New Template
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="nameOfCertificateTemplate"
                                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Template Name
                            </label>
                            <input
                                id="nameOfCertificateTemplate"
                                type="text"
                                name="nameOfCertificateTemplate"
                                placeholder="e.g., Certificate of Achievement"
                                value={formData.nameOfCertificateTemplate}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Upload Certificate Template Image
                            </label>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleImageChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Supported formats: JPEG, JPG, PNG, GIF, PDF
                            </p>
                        </div>

                        {/* Preview */}
                        {previewUrl && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Preview
                                </label>
                                <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
                                    <img
                                        src={previewUrl}
                                        alt="Template Preview"
                                        className="w-full object-contain"
                                        style={{ maxHeight: "400px" }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {uploading || loading ? "Creating..." : "Create Template"}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Templates Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading && !templates.length ? (
                    <div className="col-span-full text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading templates...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-slate-600 dark:text-slate-400">
                            No certificate templates found. Create your first template!
                        </p>
                    </div>
                ) : (
                    templates.map((template) => (
                        <div
                            key={template._id}
                            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                        >
                            {/* Image */}
                            <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                                <img
                                    src={template.imageOfCertificateTemplate}
                                    alt={template.nameOfCertificateTemplate}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    {template.nameOfCertificateTemplate}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Created: {new Date(template.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(template._id)}
                                className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                                title="Delete template"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InstitutionCertTemplate;

