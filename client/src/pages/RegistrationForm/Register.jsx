import { Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        sex: "Male",
        email: "",
        password: "",
        role: "STUDENT",
        walletAddress: "",
        institutionName: "",
        institutionPosition: "",
        accreditationInfo: "",
        studentId: "",
        college: "",
        department: "",
        major: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // API logic here
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-[12px] dark:bg-gray-900">
            {/* Dark Mode Toggle */}
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
            >
                <Sun
                    size={20}
                    className="text-slate-700 dark:hidden"
                />
                <Moon
                    size={20}
                    className="hidden text-slate-100 dark:block"
                />
            </button>

            <div className="w-full max-w-4xl">
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">Create a new account</h2>
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 grid grid-cols-1 gap-6 rounded-lg bg-white p-6 shadow-md dark:bg-slate-800 md:grid-cols-2"
                >
                    {/* Full Name Row */}
                    <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
                        <Input
                            label="First Name"
                            name="firstName"
                            placeholder="Juan"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Middle Name"
                            name="middleName"
                            placeholder="Dela"
                            value={formData.middleName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            placeholder="Cruz"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    <Select
                        label="Sex"
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        options={["Male", "Female"]}
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="juan@email.com"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <Select
                        label="Role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        options={["ADMIN", "INSTITUTION", "VERIFIER", "STUDENT"]}
                    />

                    <Input
                        label="Wallet Address (Optional)"
                        name="walletAddress"
                        placeholder="0x123abc... (Ethereum address)"
                        value={formData.walletAddress}
                        onChange={handleChange}
                    />

                    {/* Conditional Fields */}
                    {formData.role === "INSTITUTION" && (
                        <>
                            <Input
                                label="Institution Name"
                                name="institutionName"
                                placeholder="Harvard University"
                                value={formData.institutionName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Position"
                                name="institutionPosition"
                                placeholder="Dean of Admissions"
                                value={formData.institutionPosition}
                                onChange={handleChange}
                            />
                            <Input
                                label="Accreditation Info"
                                name="accreditationInfo"
                                placeholder="Accredited Level IV by CHED"
                                value={formData.accreditationInfo}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    {formData.role === "STUDENT" && (
                        <>
                            <Input
                                label="Student ID"
                                name="studentId"
                                placeholder="2022-00123"
                                value={formData.studentId}
                                onChange={handleChange}
                            />
                            <Input
                                label="College"
                                name="college"
                                placeholder="College of Computer Studies"
                                value={formData.college}
                                onChange={handleChange}
                            />
                            <Input
                                label="Department"
                                name="department"
                                placeholder="Department of Software Engineering"
                                value={formData.department}
                                onChange={handleChange}
                            />
                            <Input
                                label="Major"
                                name="major"
                                placeholder="Blockchain Development"
                                value={formData.major}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    {/* Register Button */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            Register
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Sign in here
                    </button>
                </p>
            </div>
        </div>
    );
};

// Input component
const Input = ({ label, name, type = "text", value, onChange, placeholder = "", ...props }) => (
    <div>
        <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            required
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            {...props}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm"
        />
    </div>
);

// Select component
const Select = ({ label, name, value, onChange, options }) => (
    <div>
        <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
            {label}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm"
        >
            {options.map((opt) => (
                <option
                    key={opt}
                    value={opt}
                >
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

export default Register;
