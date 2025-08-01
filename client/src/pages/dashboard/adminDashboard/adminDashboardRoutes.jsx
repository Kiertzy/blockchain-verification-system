// src/routes/adminDashboardRoutes.jsx
import { createBrowserRouter } from "react-router-dom";

import Layout from "@/pages/dashboard/adminDashboard/layout";
import DashboardPage from "@/pages/dashboard/adminDashboard/adminDashboard";
import Analytics from "./analytics";
import Reports from "./reports";
import Institutions from "./institution";
import PendingUsers from "./pendingUsers";
import Students from "./students";
import Colleges from "./colleges";
import Courses from "./courses";
import Majors from "./Majors";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "analytics",
        element: <Analytics/>,
      },
      {
        path: "reports",
        element: <Reports/>,
      },
      {
        path: "pendingUsers",
        element: <PendingUsers/>,
      },
      {
        path: "institution",
        element: <Institutions/>,
      },
      {
        path: "students",
        element: <Students/>,
      },
      {
        path: "colleges",
        element: <Colleges/>,
      },
      {
        path: "courses",
        element: <Courses/>,
      },
      {
        path: "majors",
        element: <Majors/>,
      },
      {
        path: "settings",
        element: <h1 className="title">Settings</h1>,
      },
    ],
  },
]);

export default router;
