import React, { useState, useEffect, useMemo } from "react";
import LaptopTable from "../components/LaptopTable";
import DesktopTable from "../components/DesktopTable";
import AccessoriesTable from "../components/AccessoriesTable";
import PrinterTable from "../components/PrinterTable";
import ProjectorTable from "../components/ProjectorTable";
import ClientTable from "../components/ClientTable"; //
import { useNavigate } from "react-router-dom";
import { FiHome, FiPackage, FiUser, FiBook } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import axios from "axios";


const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("Home");
  const [selectedSubCategory, setSelectedSubCategory] = useState("Laptop");
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("rememberedEmail");
    navigate("/login");
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Hàm đồng bộ client
  const handleSyncClients = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }
      await axios.post("http://localhost:5001/api/sync-clients",{},
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      alert("Danh sách người dùng đã được cập nhật!");
      fetchClients();
    } catch (error) {
      console.error("Error syncing clients:", error.message);
      alert("Cập nhật thất bại.");
    }
  };

  // Fetch clients khi trang được load
  useEffect(() => {
    fetchClients();
  }, []);

  const token = localStorage.getItem("token");

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5001/api/clients", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
  
    if (!token) {
      console.log("Token không tồn tại hoặc hết hạn. Chuyển hướng đến login...");
      navigate("/login");
      return;
    }
  
    if (role !== "admin" && role !== "user") {
      console.log("Vai trò không hợp lệ. Chuyển hướng đến Unauthorized...");
      navigate("/unauthorized");
    }
  }, [navigate]);

  // Lọc clients theo từ khóa tìm kiếm
  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      Object.values(client)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const renderContent = () => {
    switch (selectedCategory) {
      case "Home":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#002147]">
              Welcome to the Dashboard
            </h2>
            <p>Choose a category from the sidebar to view details.</p>
          </div>
        );
      case "Inventory":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-[#002147]">
              Danh sách {selectedSubCategory}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {["Laptop", "Desktop", "Accessories", "Printer", "Projector"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedSubCategory(tab)}
                    className={`w-full h-12 flex items-center justify-center text-lg font-semibold rounded-lg ${
                      selectedSubCategory === tab
                        ? "bg-[#002147] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
            {selectedSubCategory === "Laptop" && <LaptopTable />}
            {selectedSubCategory === "Desktop" && <DesktopTable />}
            {selectedSubCategory === "Accessories" && <AccessoriesTable />}
            {selectedSubCategory === "Printer" && <PrinterTable />}
            {selectedSubCategory === "Projector" && <ProjectorTable />}
          </div>
        );
        case "User":
          return (
            <ClientTable clients={clients} handleSyncClients={handleSyncClients} />
          );
        
          default:
        return null;
    }
  };

  const menuItems = [
    { label: "Home", icon: <FiHome /> },
    { label: "Inventory", icon: <FiPackage /> },
    { label: "User", icon: <FiUser /> },
    { label: "Documentation", icon: <FiBook /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#002147] mb-6">
            IT Core System
          </h1>
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center px-4 py-3 rounded-lg ${
                    selectedCategory === item.label
                      ? "bg-[#002147] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setSelectedCategory(item.label)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between bg-white shadow px-8 py-4">
          <h2 className="text-lg font-bold text-[#002147]">
            {selectedCategory}
          </h2>
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="bg-[#002147] text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
            >
              <FiUser size={20} />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40">
                {role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="text-center block w-full px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-center block w-full px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;