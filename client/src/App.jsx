// // src/App.jsx
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ThemeProvider } from "@/contexts/theme-context";

// import Login from "./pages/loginForm/Login";
// import Register from "./pages/RegistrationForm/Register";
// import AdminDashboardRoutes from "./pages/dashboard/adminDashboard/adminDashboardRoutes";

// function App() {
//   return (
//     <ThemeProvider storageKey="theme">
//       <BrowserRouter>
//         <Routes>
//           {/* Default route goes to login */}
//           <Route path="/" element={<Login />} />
//           <Route path="/register" element={<Register />} />
          
//           <Route path="/dashboard" element={<AdminDashboardRoutes />} />
          
//         </Routes>
//       </BrowserRouter>
//     </ThemeProvider>
//   );
// }

// export default App;


// src/App.jsx or wherever you define the main routes
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import LoginPage from "./pages/loginForm/Login"; // Example
import AdminDashboardRoutes from "@/pages/dashboard/adminDashboard/AdminDashboardRoutes";

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard/*" element={<AdminDashboardRoutes />} />
          {/* Add a 404 fallback if needed */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
