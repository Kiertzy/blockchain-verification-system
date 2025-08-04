import { Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const Register = () => {
  const { theme, setTheme } = useTheme();
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
    // Send data to backend here
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-white px-4 dark:bg-slate-900 transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
      >
        <Sun size={20} className="dark:hidden text-slate-700" />
        <Moon size={20} className="hidden dark:block text-slate-100" />
      </button>

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mt-6">
          Create a new account
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Full Name Row */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <Input label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>

          {/* Sex */}
          <Select
            label="Sex"
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            options={["Male", "Female"]}
          />

          {/* Email */}
          <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />

          {/* Password */}
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />

          {/* Role */}
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={["ADMIN", "INSTITUTION", "VERIFIER", "STUDENT"]}
          />

          {/* Wallet Address */}
          <Input
            label="Wallet Address (Optional)"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleChange}
            placeholder="0x..."
          />

          {/* Conditional Fields */}
          {formData.role === "INSTITUTION" && (
            <>
              <Input label="Institution Name" name="institutionName" value={formData.institutionName} onChange={handleChange} />
              <Input label="Position" name="institutionPosition" value={formData.institutionPosition} onChange={handleChange} />
              <Input label="Accreditation Info" name="accreditationInfo" value={formData.accreditationInfo} onChange={handleChange} />
            </>
          )}

          {formData.role === "STUDENT" && (
            <>
              <Input label="Student ID" name="studentId" value={formData.studentId} onChange={handleChange} />
              <Input label="College" name="college" value={formData.college} onChange={handleChange} />
              <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
              <Input label="Major" name="major" value={formData.major} onChange={handleChange} />
            </>
          )}

          {/* Register Button - spans 2 columns */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
};

// Input component
const Input = ({ label, name, type = "text", value, onChange, ...props }) => (
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
      onChange={onChange}
      {...props}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
    />
  </div>
);

// Select component
const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default Register;
