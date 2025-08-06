import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import LoginPage from "./pages/loginForm/Login"; 
import AdminDashboardRoutes from "@/pages/dashboard/adminDashboard/AdminDashboardRoutes";
  
function App() {
  return (
    <ThemeProvider storageKey="theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/*" element={<AdminDashboardRoutes />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
