import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import LoginPage from "./pages/loginForm/Login";
import Register from "./pages/RegistrationForm/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./pages/dashboard/adminDashboard/layout";
import LayoutStudent from "./pages/dashboard/studentDashboard/layout";
import DashboardPage from "./pages/dashboard/adminDashboard/adminDashboard";
import Reports from "@/pages/dashboard/adminDashboard/reports";
import Institutions from "@/pages/dashboard/adminDashboard/institution";
import PendingUsers from "@/pages/dashboard/adminDashboard/pendingUsers";
import Students from "@/pages/dashboard/adminDashboard/students";
import Colleges from "@/pages/dashboard/adminDashboard/colleges";
import Courses from "@/pages/dashboard/adminDashboard/courses";
import Majors from "@/pages/dashboard/adminDashboard/majors";
import PendingDashboard from "./pages/dashboard/pendingDashboard";

import StudentDashboardPage from "@/pages/dashboard/studentDashboard/studentDashboard";
import StudentCertificates from "@/pages/dashboard/studentDashboard/studentCertificates";
import ForgotPassword from "./pages/recoveryPassword/ForgotPassword";
import VerifyCertificates from "./pages/dashboard/adminDashboard/verifyCertificates";
import BulkVerificationCertificate from "./pages/dashboard/adminDashboard/bulkVerificationCertificate";

import InstitutionDashboard from "./pages/dashboard/institutionDashboard/institutionDashboard";
import InstitutionCertificates from "./pages/dashboard/institutionDashboard/institutionCertificates";
import InstitutionReports from "./pages/dashboard/institutionDashboard/reports";
import InstitutionCertificateList from "./pages/dashboard/institutionDashboard/institutionCertificateList";
import InstitutionCertificateStudentList from "./pages/dashboard/institutionDashboard/institutionCertificateStudentList";
import LayoutInstitution from "./pages/dashboard/institutionDashboard/layout";

import VerifierDashboard from "./pages/dashboard/verifierDashboard/verifierDashboard";
import VerifierReports from "./pages/dashboard/verifierDashboard/reports";
import VerifierCertificates from "./pages/dashboard/verifierDashboard/verifyCertificates";
import BulkVerification from "./pages/dashboard/verifierDashboard/bulkVerification";
import VerifierLayout from "./pages/dashboard/verifierDashboard/layout";
import RegistrationSuccess from "./components/registrationSuccess";


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
                        element={<PendingDashboard/>}
                    />

                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                        <Route element={<Layout />}>
                            <Route
                                path="dashboard"
                                element={<DashboardPage />}
                            />
                            <Route
                                path="reports"
                                element={<Reports />}
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
                            <Route
                                path="student-certificates"
                                element={<StudentCertificates />}
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
                                path="certificates/reports"
                                element={<InstitutionReports />}
                            />
                             <Route
                                path="certificates/issue"
                                element={<InstitutionCertificates />}
                            />
                            <Route
                                path="certificates/list"
                                element={<InstitutionCertificateList />}
                            />
                            <Route
                                path="certificates/student/list"
                                element={<InstitutionCertificateStudentList />}
                            />
                            {/* <Route
                                path="pending-dashboard"
                                element={<PendingDashboard/>}
                            /> */}
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
