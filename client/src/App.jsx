// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import router from "@/pages/dashboard/adminDashboard/adminDashboardRoutes";

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
