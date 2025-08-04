// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { ThemeProvider } from "@/contexts/theme-context";

// import Layout from "./layout";
// import DashboardPage from "./adminDashboard";
// import Analytics from "./analytics";
// import Reports from "./reports";
// import Institutions from "./institution";
// import PendingUsers from "./pendingUsers";
// import Students from "./students";
// import Colleges from "./colleges";
// import Courses from "./courses";
// import Majors from "./majors";

// function AdminDashboardRoutes() {
//     const router = createBrowserRouter([
//         {
//             path: "/",
//             element: <Layout />,
//             children: [
//                 {
//                     index: true,
//                     element: <DashboardPage />,
//                 },
//                 {
//                     path: "analytics",
//                     element: <Analytics />,
//                 },
//                 {
//                     path: "reports",
//                     element: <Reports />,
//                 },
//                 {
//                     path: "pending-users",
//                     element: <PendingUsers />,
//                 },
//                 {
//                     path: "institution",
//                     element: <Institutions />,
//                 },
//                 {
//                     path: "students",
//                     element: <Students />,
//                 },
//                 {
//                     path: "colleges",
//                     element: <Colleges />,
//                 },
//                 {
//                     path: "courses",
//                     element: <Courses />,
//                 },
//                 {
//                     path: "majors",
//                     element: <Majors />,
//                 },
//                 {
//                     path: "settings",
//                     element: <h1 className="title">Settings</h1>,
//                 },
//             ],
//         },
//     ]);

//     return (
//         <ThemeProvider storageKey="theme">
//             <RouterProvider router={router} />
//         </ThemeProvider>
//     );
// }

// export default AdminDashboardRoutes;

// src/pages/dashboard/adminDashboard/AdminDashboardRoutes.jsx
import { Routes, Route } from "react-router-dom";

import Layout from "./layout";
import DashboardPage from "./adminDashboard";
import Analytics from "./analytics";
import Reports from "./reports";
import Institutions from "./institution";
import PendingUsers from "./pendingUsers";
import Students from "./students";
import Colleges from "./colleges";
import Courses from "./courses";
import Majors from "./majors";

function AdminDashboardRoutes() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="pending-users" element={<PendingUsers />} />
        <Route path="institution" element={<Institutions />} />
        <Route path="students" element={<Students />} />
        <Route path="colleges" element={<Colleges />} />
        <Route path="courses" element={<Courses />} />
        <Route path="majors" element={<Majors />} />
        <Route path="settings" element={<h1 className="title">Settings</h1>} />
      </Routes>
    </Layout>
  );
}

export default AdminDashboardRoutes;
