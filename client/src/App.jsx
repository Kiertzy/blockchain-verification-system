// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import router from "@/pages/dashboard/adminDashboard/adminDashboardRoutes";
import Login from "./pages/loginForm/Login";
import Register from "./pages/RegistrationForm/Register";

function App() {
  return (
    <ThemeProvider storageKey="theme">
      {/* <RouterProvider router={router} /> */}
      {/* <Login/> */}
      <Register/>
    </ThemeProvider>
  );
}

export default App;
