import React, { useEffect, useState } from "react";
import axios from "axios";

const UserTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/users/sync-users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#002147]">User Management</h2>
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-gray-600">Tên</th>
            <th className="px-4 py-2 text-left text-gray-600">Email</th>
            <th className="px-4 py-2 text-left text-gray-600">Ảnh đại diện</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.displayName}</td>
                <td className="px-4 py-2">{user.mail}</td>
                <td className="px-4 py-2">
                  {user.photo ? (
                    <img
                      src={`data:image/jpeg;base64,${user.photo}`}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    "No Photo"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;