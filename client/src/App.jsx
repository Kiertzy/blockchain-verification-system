import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import LoginPage from "./pages/loginForm/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./pages/dashboard/adminDashboard/layout";
import DashboardPage from "./pages/dashboard/adminDashboard/adminDashboard";
import Analytics from "@/pages/dashboard/adminDashboard/analytics";
import Reports from "@/pages/dashboard/adminDashboard/reports";
import Institutions from "@/pages/dashboard/adminDashboard/institution";
import PendingUsers from "@/pages/dashboard/adminDashboard/pendingUsers";
import Students from "@/pages/dashboard/adminDashboard/students";
import Colleges from "@/pages/dashboard/adminDashboard/colleges";
import Courses from "@/pages/dashboard/adminDashboard/courses";
import Majors from "@/pages/dashboard/adminDashboard/majors";

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="pending-users" element={<PendingUsers />} />
              <Route path="institution" element={<Institutions />} />
              <Route path="students" element={<Students />} />
              <Route path="colleges" element={<Colleges />} />
              <Route path="courses" element={<Courses />} />
              <Route path="majors" element={<Majors />} />
              <Route path="settings" element={<h1 className="title">Settings</h1>} />
              <Route path="*" element={<h1 className="text-red-500">404 - Page Not Found</h1>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
