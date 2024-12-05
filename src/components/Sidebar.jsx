import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Laptop", path: "/laptops", icon: "💻" },
    { name: "Desktop", path: "/desktops", icon: "🖥️" },
    { name: "Accessories", path: "/accessories", icon: "🎧" },
    { name: "Printer", path: "/printers", icon: "🖨️" },
    { name: "Projector/SmartBoard", path: "/projectors", icon: "📽️" },
  ];

  return (
    <div className="bg-gray-800 text-white h-screen p-4 w-60">
      <h2 className="text-2xl font-bold mb-6">IT Assets</h2>
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;