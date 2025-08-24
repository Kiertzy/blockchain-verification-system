import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import LoginPage from "./pages/loginForm/Login";
import Register from "./pages/RegistrationForm/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./pages/dashboard/adminDashboard/layout";
import LayoutStudent from "./pages/dashboard/studentDashboard/layout";
import DashboardPage from "./pages/dashboard/adminDashboard/adminDashboard";
import Institutions from "@/pages/dashboard/adminDashboard/institution";
import PendingUsers from "@/pages/dashboard/adminDashboard/pendingUsers";
import Students from "@/pages/dashboard/adminDashboard/students";
import Colleges from "@/pages/dashboard/adminDashboard/colleges";
import Courses from "@/pages/dashboard/adminDashboard/courses";
import Majors from "@/pages/dashboard/adminDashboard/majors";
import PendingDashboard from "./pages/dashboard/pendingDashboard";
import AdminStudentDetails from "./pages/dashboard/adminDashboard/AdminStudentDetails";
import AdminViewCertificateDetails from "./pages/dashboard/adminDashboard/adminViewCertificateDetails";
import AdminInstitutionDetails from "./pages/dashboard/adminDashboard/AdminInstitutionDetails";
import Admin from "./pages/dashboard/adminDashboard/admin";
import AdminDetails from "./pages/dashboard/adminDashboard/AdminDetails";
import Verifier from "./pages/dashboard/adminDashboard/verifier";
import AdminVerifierDetails from "./pages/dashboard/adminDashboard/AdminVerifierDetails";

import StudentDashboardPage from "@/pages/dashboard/studentDashboard/studentDashboard";
import StudentViewCertificateDetails from "@/pages/dashboard/studentDashboard/studentViewCertificateDetails.jsx";
import ViewVerifiedCertificateDetails from "./pages/dashboard/studentDashboard/viewVerifiedCertificateDetails";

import ForgotPassword from "./pages/recoveryPassword/ForgotPassword";
import VerifyCertificates from "./pages/dashboard/adminDashboard/verifyCertificates";
import BulkVerificationCertificate from "./pages/dashboard/adminDashboard/bulkVerificationCertificate";

import InstitutionDashboard from "./pages/dashboard/institutionDashboard/institutionDashboard";
import InstitutionCertificates from "./pages/dashboard/institutionDashboard/institutionCertificates";
import InstitutionCertificateStudentList from "./pages/dashboard/institutionDashboard/institutionCertificateStudentList";
import InstitutionStudentDetails from "./pages/dashboard/institutionDashboard/studentDetails";
import InstitutionCertificateDetails from "./pages/dashboard/institutionDashboard/viewCertificateDetails";
import LayoutInstitution from "./pages/dashboard/institutionDashboard/layout";

import VerifierDashboard from "./pages/dashboard/verifierDashboard/verifierDashboard";
import VerifierReports from "./pages/dashboard/verifierDashboard/reports";
import VerifierCertificates from "./pages/dashboard/verifierDashboard/verifyCertificates";
import BulkVerification from "./pages/dashboard/verifierDashboard/bulkVerification";
import VerifierLayout from "./pages/dashboard/verifierDashboard/layout";
import RegistrationSuccess from "./components/registrationSuccess";
import CertificateDetails from "./components/CertificateDetails";

function App() {
    return (
        <ThemeProvider storageKey="theme">
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/registration-success"
                        element={<RegistrationSuccess />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="pending-dashboard"
                        element={<PendingDashboard />}
                    />

                    <Route
                        path="/certificates/student/certificate/view/:certId"
                        element={<StudentViewCertificateDetails />}
                    />

                    <Route
                        path="/certificates/student/verify/:certId"
                        element={<StudentViewCertificateDetails />}
                    />

                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                        <Route element={<Layout />}>
                            <Route
                                path="dashboard"
                                element={<DashboardPage />}
                            />
                            <Route
                                path="pending-users"
                                element={<PendingUsers />}
                            />
                            <Route
                                path="institution"
                                element={<Institutions />}
                            />
                            <Route
                                path="students"
                                element={<Students />}
                            />
                            <Route
                                path="admin"
                                element={<Admin />}
                            />
                            <Route
                                path="verifier"
                                element={<Verifier />}
                            />
                            <Route
                                path="colleges"
                                element={<Colleges />}
                            />
                            <Route
                                path="courses"
                                element={<Courses />}
                            />
                            <Route
                                path="majors"
                                element={<Majors />}
                            />
                            <Route
                                path="certificates/verify"
                                element={<VerifyCertificates />}
                            />
                            <Route
                                path="certificates/bulk-verification"
                                element={<BulkVerificationCertificate />}
                            />
                            <Route
                                path="certificates/admin/student-details/:id"
                                element={<AdminStudentDetails />}
                            />
                            <Route
                                path="certificates/admin/institution-details/:id"
                                element={<AdminInstitutionDetails />}
                            />
                            <Route
                                path="admin/details/:id"
                                element={<AdminDetails />}
                            />
                            <Route
                                path="admin/verifier/details/:id"
                                element={<AdminVerifierDetails />}
                            />
                            <Route
                                path="certificates/admin/student/certificate/:certId"
                                element={<AdminViewCertificateDetails />}
                            />
                            <Route
                                path="*"
                                element={<h1 className="text-red-500">404 - Page Not Found</h1>}
                            />
                        </Route>
                    </Route>

                    {/* Student Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
                        <Route element={<LayoutStudent />}>
                            <Route
                                path="student-dashboard"
                                element={<StudentDashboardPage />}
                            />
                        </Route>
                    </Route>

                    {/* Institution Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["INSTITUTION"]} />}>
                        <Route element={<LayoutInstitution />}>
                            <Route
                                path="institution-dashboard"
                                element={<InstitutionDashboard />}
                            />
                           
                            <Route
                                path="certificates/issue"
                                element={<InstitutionCertificates />}
                            />
                           
                            <Route
                                path="certificates/student/details/:id"
                                element={<InstitutionStudentDetails />}
                            />
                            <Route
                                path="certificates/student/list"
                                element={<InstitutionCertificateStudentList />}
                            />

                            <Route
                                path="/certificate/details/:certId"
                                element={<InstitutionCertificateDetails />}
                            />
    
                            <Route
                                path="/certificate/:id"
                                element={<CertificateDetails />}
                            />
                        </Route>
                    </Route>

                    {/* Institution Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["VERIFIER"]} />}>
                        <Route element={<VerifierLayout />}>
                            <Route
                                path="/verifier/dashboard"
                                element={<VerifierDashboard />}
                            />
                            <Route
                                path="/verifier/reports"
                                element={<VerifierReports />}
                            />
                            <Route
                                path="verifier/certificates/verify"
                                element={<VerifierCertificates />}
                            />
                            <Route
                                path="verifier/certificates/bulk-verification"
                                element={<BulkVerification />}
                            />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
