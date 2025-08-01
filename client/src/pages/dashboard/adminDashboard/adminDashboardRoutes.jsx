// src/routes/adminDashboardRoutes.jsx
import { createBrowserRouter } from "react-router-dom";

import Layout from "@/pages/dashboard/adminDashboard/layout";
import DashboardPage from "@/pages/dashboard/adminDashboard/adminDashboard";
import Analytics from "./analytics";
import Reports from "./reports";
import Institutions from "./institution";

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
        path: "institution",
        element: <Institutions/>,
      },
    //   {
    //     path: "new-customer",
    //     element: <h1 className="title">New Customer</h1>,
    //   },
    //   {
    //     path: "verified-customers",
    //     element: <h1 className="title">Verified Customers</h1>,
    //   },
    //   {
    //     path: "products",
    //     element: <h1 className="title">Products</h1>,
    //   },
    //   {
    //     path: "new-product",
    //     element: <h1 className="title">New Product</h1>,
    //   },
    //   {
    //     path: "inventory",
    //     element: <h1 className="title">Inventory</h1>,
    //   },
    //   {
    //     path: "settings",
    //     element: <h1 className="title">Settings</h1>,
    //   },
    ],
  },
]);

export default router;
