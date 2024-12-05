import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ITProductCard from "./components/ITProductCard";
import LaptopTable from "./components/LaptopTable";

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Trang Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Trang IT Product Card */}
        <Route
          path="/itproductcard/:id"
          element={<ITProductCard />}
        />

        {/* Trang Laptop Table */}
        <Route exact path="/" element={<LaptopTable />} />
        
        
        {/* Trang Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Điều hướng mặc định */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;