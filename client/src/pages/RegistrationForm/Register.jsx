import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    registerUser,
    clearRegistrationState
} from "@/store/slices/registrationSlice";
import { getAllColleges } from "../../store/slices/collegeSlice";
import { getAllCourses } from "../../store/slices/courseSlice";
import { getAllMajors } from "../../store/slices/majorSlice";


const Register = () => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { colleges } = useSelector((state) => state.college);
    const { courses } = useSelector((state) => state.course);
    const { majors } = useSelector((state) => state.major);

    const { loading, error, message } = useSelector((state) => state.registration);

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

    // Load dropdown data
    useEffect(() => {
        dispatch(getAllColleges());
        dispatch(getAllCourses());
        dispatch(getAllMajors());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerUser(formData));
    };

    // After successful registration
    useEffect(() => {
        if (message) {
            alert(message);
            dispatch(clearRegistrationState());
            navigate("/"); // Redirect to login
        }
    }, [message, dispatch, navigate]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-[12px] dark:bg-gray-900">
            {/* Dark Mode Toggle */}
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
            >
                <Sun size={20} className="text-slate-700 dark:hidden" />
                <Moon size={20} className="hidden text-slate-100 dark:block" />
            </button>

            <div className="w-full max-w-4xl">
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    Create a new account
                </h2>

                {error && <p className="mt-2 text-center text-red-500">{error}</p>}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 grid grid-cols-1 gap-6 rounded-lg bg-white p-6 shadow-md dark:bg-slate-800 md:grid-cols-2"
                >
                    {/* Full Name Row */}
                    <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
                        <Input label="First Name" name="firstName" placeholder="Juan" value={formData.firstName} onChange={handleChange} />
                        <Input label="Middle Name" name="middleName" placeholder="Dela" value={formData.middleName} onChange={handleChange} />
                        <Input label="Last Name" name="lastName" placeholder="Cruz" value={formData.lastName} onChange={handleChange} />
                    </div>

                    <SelectSex label="Sex" name="sex" value={formData.sex} onChange={handleChange} options={["Male", "Female"]} />

                    <Input label="Email Address" name="email" type="email" placeholder="juan@email.com" value={formData.email} onChange={handleChange} />
                    <Input label="Password" name="password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />

                    <SelectRole label="Role" name="role" value={formData.role} onChange={handleChange} options={["ADMIN", "INSTITUTION", "VERIFIER", "STUDENT"]} />

                    <Input label="Wallet Address" name="walletAddress" placeholder="0x123abc... (Ethereum address)" value={formData.walletAddress} onChange={handleChange} />

                    {/* Conditional Fields */}
                    {formData.role === "INSTITUTION" && (
                        <>
                            <Input label="Institution Name" name="institutionName" placeholder="Harvard University" value={formData.institutionName} onChange={handleChange} />
                            <Input label="Position" name="institutionPosition" placeholder="Dean of Admissions" value={formData.institutionPosition} onChange={handleChange} />
                            <Input label="Accreditation Info" name="accreditationInfo" placeholder="Accredited Level IV by CHED" value={formData.accreditationInfo} onChange={handleChange} />
                        </>
                    )}

                    {formData.role === "STUDENT" && (
                        <>
                            <Input label="Student ID" name="studentId" placeholder="2022-00123" value={formData.studentId} onChange={handleChange} />
                            <Select
                                label="College"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                options={(colleges || []).map((c) => ({
                                    label: c.collegeName,
                                    value: c.collegeName
                                }))}
                            />

                            {/* Department Dropdown */}
                            <Select
                                label="Department / Course"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                options={(courses || []).map((c) => ({
                                    label: c.courseName,
                                    value: c.courseName
                                }))}
                            />

                            {/* Major Dropdown */}
                            <Select
                                label="Major"
                                name="major"
                                value={formData.major}
                                onChange={handleChange}
                                options={(majors || []).map((m) => ({
                                    label: m.majorName,
                                    value: m.majorName
                                }))}
                            />
                        </>
                    )}

                    {/* Register Button */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Registering..." : "Register"}
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
// eslint-disable-next-line react/prop-types
const Input = ({ label, name, type = "text", value, onChange, placeholder = "", ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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
const SelectRole = ({ label, name, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

const SelectSex = ({ label, name, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

// eslint-disable-next-line react/prop-types
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
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm"
        >
            <option value="">Select {label}</option>
            {options.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);


export default Register;
