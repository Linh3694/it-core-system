import React, { useState, useMemo } from "react";

const ClientTable = ({ clients, handleSyncClients }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc clients theo từ khóa tìm kiếm
  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      Object.values(client)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Phân trang dữ liệu
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredClients.slice(start, end);
  }, [filteredClients, currentPage, itemsPerPage]);

  // Tổng số trang
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Xử lý thay đổi số lượng items hiển thị
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#002147]">Danh sách Người dùng</h2>
        <button
          onClick={handleSyncClients}
          className="bg-[#002147] text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
        >
          Đồng bộ
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-1/3"
        />
        <div className="flex items-center">
          <label className="mr-2">Hiển thị:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Bảng hiển thị */}
      <table className="min-w-full border-collapse rounded-lg shadow-md ">
        <thead className="bg-[#002147] border-collapse rounded-lg text-white">
          <tr>
            <th className="px-4 py-2 text-center">Tên</th>
            <th className="px-4 py-2 text-center">Email</th>
            <th className="px-4 py-2 text-center">Chức vụ</th>
          </tr>
        </thead>
        <tbody>
          {paginatedClients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-semibold">{client.name}</td>
              <td className="px-4 py-2">{client.email}</td>
              <td
                className="px-4 py-2 role-column"
                style={{
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={client.jobTitle} // Hiển thị toàn bộ nội dung khi hover
              >
                {client.jobTitle}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 font-semibold text-white border rounded bg-[#FF5733] hover:bg-[#002147] disabled:bg-[#002147] disabled:cursor-not-allowed"
        >
          Trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 font-semibold text-white border rounded bg-[#FF5733] hover:bg-[#002147] disabled:bg-[#002147] disabled:cursor-not-allowed"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
};

export default ClientTable;