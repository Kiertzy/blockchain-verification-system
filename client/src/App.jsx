import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthSync } from "./hooks/useAuthSync";

// Pages
import LoginPage from "./pages/loginForm/Login";
import Register from "./pages/RegistrationForm/Register";
import PendingDashboard from "./pages/dashboard/pendingDashboard";
import ForgotPassword from "./pages/recoveryPassword/ForgotPassword";
import RegistrationSuccess from "./components/registrationSuccess";

// Admin
import Layout from "./pages/dashboard/adminDashboard/layout";
import DashboardPage from "./pages/dashboard/adminDashboard/adminDashboard";
import Institutions from "@/pages/dashboard/adminDashboard/institution";
import PendingUsers from "@/pages/dashboard/adminDashboard/pendingUsers";
import Students from "@/pages/dashboard/adminDashboard/students";
import Colleges from "@/pages/dashboard/adminDashboard/colleges";
import Courses from "@/pages/dashboard/adminDashboard/courses";
import Majors from "@/pages/dashboard/adminDashboard/majors";
import AdminStudentDetails from "./pages/dashboard/adminDashboard/AdminStudentDetails";
import AdminViewCertificateDetails from "./pages/dashboard/adminDashboard/adminViewCertificateDetails";
import AdminInstitutionDetails from "./pages/dashboard/adminDashboard/AdminInstitutionDetails";
import Admin from "./pages/dashboard/adminDashboard/admin";
import AdminDetails from "./pages/dashboard/adminDashboard/AdminDetails";
import Verifier from "./pages/dashboard/adminDashboard/verifier";
import AdminVerifierDetails from "./pages/dashboard/adminDashboard/AdminVerifierDetails";
import VerifyCertificates from "./pages/dashboard/adminDashboard/verifyCertificates";
import BulkVerificationCertificate from "./pages/dashboard/adminDashboard/bulkVerificationCertificate";

// Student
import LayoutStudent from "./pages/dashboard/studentDashboard/layout";
import StudentDashboardPage from "@/pages/dashboard/studentDashboard/studentDashboard";
import StudentViewCertificateDetails from "@/pages/dashboard/studentDashboard/studentViewCertificateDetails";
import ViewVerifiedCertificateDetails from "./pages/dashboard/studentDashboard/viewVerifiedCertificateDetails";

// Institution
import LayoutInstitution from "./pages/dashboard/institutionDashboard/layout";
import InstitutionDashboard from "./pages/dashboard/institutionDashboard/institutionDashboard";
import InstitutionCertificates from "./pages/dashboard/institutionDashboard/institutionCertificates";
import InstitutionCertificateStudentList from "./pages/dashboard/institutionDashboard/institutionCertificateStudentList";
import InstitutionStudentDetails from "./pages/dashboard/institutionDashboard/studentDetails";
import InstitutionCertificateDetails from "./pages/dashboard/institutionDashboard/viewCertificateDetails";
import InstitutionCertTemplate from "./pages/dashboard/institutionDashboard/institutionCertTemplate";
import InstitutionBulkCertificates from "./pages/dashboard/institutionDashboard/institutionBulkCertificates";

import CertificateDetails from "./components/CertificateDetails";

// Verifier
import VerifierLayout from "./pages/dashboard/verifierDashboard/layout";
import VerifierDashboard from "./pages/dashboard/verifierDashboard/verifierDashboard";
import VerifierReports from "./pages/dashboard/verifierDashboard/reports";
import VerifierCertificates from "./pages/dashboard/verifierDashboard/verifyCertificates";
import BulkVerification from "./pages/dashboard/verifierDashboard/bulkVerification";
import VerifierStudentDetails from "./pages/dashboard/verifierDashboard/verifierStudentDetails";
import VerifierViewCertificateDetails from "./pages/dashboard/verifierDashboard/verifierViewCertificateDetails";
import QrcodeScanner from "./pages/dashboard/verifierDashboard/qrcodeScanner";
import VerifiedCertificates from "./pages/dashboard/verifierDashboard/verifiedCertificates";
import PendingCertVerification from "./pages/dashboard/verifierDashboard/pendingCertVerification";
import NotVerifiedCertificates from "./pages/dashboard/verifierDashboard/notVerifiedCertificates";

// Auth Sync Wrapper Component
function AppContent() {
  useAuthSync(); // Enable cross-tab auth synchronization
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/pending-dashboard" element={<PendingDashboard />} />

      {/* Public certificate links (anyone can open via link, even student) */}
      <Route path="/certificates/student/certificate/view/:certId" element={<StudentViewCertificateDetails />} />
      <Route path="/certificates/student/verify/:certId" element={<ViewVerifiedCertificateDetails />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pending-users" element={<PendingUsers />} />
          <Route path="institution" element={<Institutions />} />
          <Route path="students" element={<Students />} />
          <Route path="admin" element={<Admin />} />
          <Route path="verifier" element={<Verifier />} />
          <Route path="colleges" element={<Colleges />} />
          <Route path="courses" element={<Courses />} />
          <Route path="majors" element={<Majors />} />
          <Route path="certificates/verify" element={<VerifyCertificates />} />
          <Route path="certificates/bulk-verification" element={<BulkVerificationCertificate />} />
          <Route path="certificates/admin/student-details/:id" element={<AdminStudentDetails />} />
          <Route path="certificates/admin/institution-details/:id" element={<AdminInstitutionDetails />} />
          <Route path="admin/details/:id" element={<AdminDetails />} />
          <Route path="admin/verifier/details/:id" element={<AdminVerifierDetails />} />
          <Route path="certificates/admin/student/certificate/:certId" element={<AdminViewCertificateDetails />} />
        </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route element={<LayoutStudent />}>
          <Route path="student-dashboard" element={<StudentDashboardPage />} />
        </Route>
      </Route>

      {/* Institution Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["INSTITUTION"]} />}>
        <Route element={<LayoutInstitution />}>
          <Route path="institution-dashboard" element={<InstitutionDashboard />} />
          <Route path="certificates/issue" element={<InstitutionCertificates />} />
          <Route path="certificates/bulk-issue" element={<InstitutionBulkCertificates />} />
          <Route path="certificates/templates" element={<InstitutionCertTemplate />} />
          <Route path="certificates/student/details/:id" element={<InstitutionStudentDetails />} />
          <Route path="certificates/student/list" element={<InstitutionCertificateStudentList />} />
          <Route path="/certificate/details/:certId" element={<InstitutionCertificateDetails />} />
          <Route path="/certificate/:id" element={<CertificateDetails />} />
        </Route>
      </Route>

      {/* Verifier Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["VERIFIER"]} />}>
        <Route element={<VerifierLayout />}>
          <Route path="/verifier/dashboard" element={<VerifierDashboard />} />
          <Route path="/verifier/reports" element={<VerifierReports />} />
          <Route path="verifier/certificates/verify" element={<VerifierCertificates />} />
          <Route path="verifier/certificates/student-details/:id" element={<VerifierStudentDetails />} />
          <Route path="certificates/verifier/student/certificate/:certId" element={<VerifierViewCertificateDetails />} />
          <Route path="verifier/certificates/bulk-verification" element={<BulkVerification />} />
          <Route path="verifier/certificates/qr-scanner" element={<QrcodeScanner/>} />
          <Route path="verifier/certificates/verified-certificates" element={<VerifiedCertificates/>} />
          <Route path="verifier/certificates/pending-certificates" element={<PendingCertVerification/>} />
          <Route path="verifier/certificates/not-verified-certificates" element={<NotVerifiedCertificates/>} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<h1 className="text-red-500">404 - Page Not Found</h1>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;