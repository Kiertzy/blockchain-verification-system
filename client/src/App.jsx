// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import router from "@/pages/dashboard/adminDashboard/adminDashboardRoutes";
import Login from "./pages/loginForm/Login";

function App() {
  return (
    <ThemeProvider storageKey="theme">
      {/* <RouterProvider router={router} /> */}
      <Login/>
    </ThemeProvider>
  );
}

export default App;
