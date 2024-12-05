import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ITProductCard from "./ITProductCard"; // Import bảng chi tiết laptop
import * as XLSX from "xlsx";


const LaptopTable = () => {
          
        const [data, setData] = useState([]); // State cho danh sách laptops
        const [users, setUsers] = useState([]); // Lưu danh sách users từ API
        const [showAddModal, setShowAddModal] = useState(false); // State để điều khiển modal 
        const [newLaptop, setNewLaptop] = useState({
            name: "",
            manufacturer: "",
            serial: "",
            assigned: [],
            status: "Active",
            releaseYear: "",
            specs: {
              processor: "",
              ram: "",
              storage: "",
              display: "",
          },
          }); 
        const [editingLaptop, setEditingLaptop] = useState({
            name: "",
            manufacturer: "",
            serial: "",
            assigned: [],
            status: "Active",
            releaseYear: "",
            specs: {
              processor: "",
              ram: "",
              storage: "",
              display: "",
          },
          });
        const [showEditModal, setShowEditModal] = useState(false);
        const [filteredUsers, setFilteredUsers] = useState([]); // Lưu danh sách gợi ý tạm thời
        const [showSuggestions, setShowSuggestions] = useState(false); // Kiểm soát hiển thị gợi ý
        const [showConfirmModal, setShowConfirmModal] = useState(false);
        const [laptopToDelete, setLaptopToDelete] = useState(null);
        const [selectedLaptop, setSelectedLaptop] = useState(null);
        const [showDetailModal, setShowDetailModal] = useState(false); // Kiểm soát hiển thị modal
        const [showUploadModal, setShowUploadModal] = useState(false);
        const [parsedData, setParsedData] = useState([]);

          const handleDeleteRepair = async (laptopId, repairId) => {
            console.log("Laptop ID:", laptopId);
            console.log("Repair ID:", repairId);
          
            if (!repairId) {
              console.error("repairId không hợp lệ.");
              return;
            }
          
            try {
              const token = localStorage.getItem("authToken");
              await axios.delete(
                `http://localhost:5001/api/laptops/${laptopId}/repairs/${repairId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setSelectedLaptop((prevLaptop) => ({
        ...prevLaptop,
        repairs: prevLaptop.repairs.filter((repair) => repair._id !== repairId),
      }));
              toast.success("Xóa nhật ký sửa chữa thành công!");
              fetchLaptops();
            } catch (error) {
              console.error("Error deleting repair log:", error);
              toast.error("Không thể xóa nhật ký sửa chữa!");
            }
          };
        
          const handleAddRepair = async (repairData) => {
              try {

                const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { fullname: "Không xác định" }; // Lấy thông tin người dùng hiện tại
                const payload = {
                  description: repairData.description || "Không có mô tả",
                  date: repairData.date || new Date().toISOString(),
                  updatedBy: currentUser.fullname,
                };

                console.log("Payload:", payload);
                console.log("Gửi yêu cầu tới:", `http://localhost:5001/api/laptops/${selectedLaptop._id}/repairs`);
                console.log("Payload:", repairData);
                console.log("Selected laptop:", selectedLaptop);
                console.log("Payload:", {
                  description: repairData.description,
                  date: repairData.date || new Date().toISOString(),
                  updatedBy: currentUser.fullname,
                });
                console.log("Token:", localStorage.getItem("authToken"));
                const response = await fetch(`http://localhost:5001/api/laptops/${selectedLaptop._id}/repairs`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                  },
                  body: JSON.stringify(payload),
                });
            
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error("API Error:", errorText);
                  throw new Error(errorText || "Failed to add repair log");
                }
                const updatedRepair = await response.json();
            
                setSelectedLaptop((prevLaptop) => ({
                  ...prevLaptop,
                  repairs: [updatedRepair, ...(prevLaptop.repairs || [])], // Thêm nhật ký sửa chữa mới vào đầu danh sách
                }));
            
                console.log("Repair log updated successfully:", updatedRepair);
              } catch (error) {
                console.error("Error adding repair log:", error);
              }
          };
          
          console.log("Props truyền vào ITProductCard:", {
            laptopData: selectedLaptop,
            onDeleteRepair: handleDeleteRepair,
          });

          <ITProductCard
            laptopData={{
              ...selectedLaptop,
              repairs: selectedLaptop?.repairs || [], // Đảm bảo repairs là mảng
            }}
            onAddRepair={(repair) => {
                    // Gọi API thêm nhật ký sửa chữa
                    fetch(`http://localhost:5001/api/laptops/${selectedLaptop._id}/repairs`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(repair),
                    })
                      .then((response) => {
                        if (response.ok) {
                          console.log("Repair saved successfully");
                          // Cập nhật dữ liệu laptop hoặc làm gì đó khác
                        } else {
                          console.error("Failed to save repair");
                        }
                      })
                      .catch((error) => console.error("Error saving repair:", error));
               }}
            currentUser={JSON.parse(localStorage.getItem("currentUser"))}
            onDeleteRepair={handleDeleteRepair}
            />
          
          const handleViewDetails = (laptop) => {
            setSelectedLaptop(laptop); // Lưu thiết bị được chọn
            setShowDetailModal(true); // Hiển thị modal
          };

          // Hàm gọi API để lấy danh sách laptops
          const fetchLaptops = async () => {
            try {
              const token = localStorage.getItem("authToken");
              const response = await axios.get("http://localhost:5001/api/laptops", {
                headers: { Authorization: `Bearer ${token}` },
              });

              // Map dữ liệu `assigned` để phù hợp với định dạng giao diện
              const laptops = response.data.map((laptop) => ({
                ...laptop,
                assigned: laptop.assigned.map((user) => ({
                  value: user._id,
                  label: user.name,
                })),
              }));
              setData(laptops);
              console.log("Laptops fetched:", response.data); // Log dữ liệu
              setData(response.data);
            } catch (error) {
              console.error("Error fetching laptops:", error);
              setData([]);
            }
          };

          // Lấy danh sách users
       
          const fetchUsers = async () => {
            try {
              const token = localStorage.getItem("authToken");
              const response = await axios.get("http://localhost:5001/api/clients", {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (response.data && Array.isArray(response.data)) {
                setUsers(
                  response.data.map((user) => ({
                    value: user._id,
                    label: user.name,
                  }))
                );
              } else {
                console.error("API không trả về danh sách người dùng hợp lệ");
                setUsers([]);
              }
            } catch (error) {
              console.error("Lỗi khi lấy danh sách users:", error);
              setUsers([]);
            }
          };

          const handleDelete = async (id) => {
            if (!laptopToDelete) return;

              try {
                await axios.delete(`http://localhost:5001/api/laptops/${laptopToDelete._id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Thêm token ở đây
                  },
                }
                );
                fetchLaptops(); // Cập nhật lại danh sách sau khi xóa
                toast.success("Laptop đã được xóa!", {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              } catch (error) {
                console.error("Error deleting laptop:", error);
                toast.error("Có lỗi xảy ra khi xóa laptop!", {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              } finally {
                setShowConfirmModal(false); // Đóng modal
                setLaptopToDelete(null); // Reset laptop cần xóa
              }
          };

          const handleEdit = (item) => {
              setEditingLaptop({
                ...item,
                releaseYear: item.releaseYear || "", // Đảm bảo có giá trị mặc định cho Năm sản xuất
                specs: {
                  processor: item.specs?.processor || "",
                  ram: item.specs?.ram || "",
                  storage: item.specs?.storage || "",
                  display: item.specs?.display || "",
                },
                assigned: Array.isArray(item.assigned)
                  ? item.assigned.map((user) => ({
                      value: user.value || user._id, // Đảm bảo định dạng user
                      label: user.label || user.name,
                    }))
                  : [],
              });
              setShowEditModal(true); // Hiển thị modal chỉnh sửa
          };

          const confirmDelete = (laptop) => {
            setLaptopToDelete(laptop); // Đặt laptop cần xóa
            setShowConfirmModal(true); // Hiển thị modal xác nhận
          };
          
          const handleAddLaptop = async (e) => {
            e.preventDefault();
          
            try {
              // Kiểm tra dữ liệu nhập
              if (!newLaptop.name || !newLaptop.manufacturer || !newLaptop.serial || !newLaptop.status) {
                toast.error("Vui lòng điền đầy đủ thông tin!", {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
                return;
              }
          
              // Chuẩn bị payload
              const payload = {
                ...newLaptop,
                releaseYear: newLaptop.releaseYear || "",
                specs: {
                  processor: newLaptop.specs?.processor || "",
                  ram: newLaptop.specs?.ram || "",
                  storage: newLaptop.specs?.storage || "",
                  display: newLaptop.specs?.display || "",
                },
                assigned: newLaptop.assigned?.map((user) => user.value) || [], // Xử lý danh sách người dùng
              };
          
              console.log("Payload gửi lên:", payload);
              console.log("Dữ liệu gửi đi:", newLaptop);
          
              // Gửi dữ liệu lên API
              const response = await axios.post("http://localhost:5001/api/laptops", payload, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Đảm bảo token được gửi kèm
                },
              });
          
              if (response.status === 201) {
                toast.success("Thêm laptop thành công!", {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
          
                // Cập nhật danh sách laptops và đóng modal
                fetchLaptops();
                setShowAddModal(false);
                setNewLaptop({
                  name: "",
                  manufacturer: "",
                  serial: "",
                  releaseYear: "",
                  specs: {
                    processor: "",
                    ram: "",
                    storage: "",
                    display: "",
                  },
                  assigned: [],
                  status: "Active",
                });
              }
            } catch (error) {
              console.error("Lỗi khi thêm laptop:", error);
              toast.error("Có lỗi xảy ra khi thêm laptop. Vui lòng thử lại!", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
          };

          const handleFileChange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
          
            reader.onload = (event) => {
              const binaryStr = event.target.result;
              const workbook = XLSX.read(binaryStr, { type: "binary" });
              const sheetName = workbook.SheetNames[0];
              const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          
              // Chuẩn hóa dữ liệu
              const normalizedData = sheetData.map((row) => ({
                name: row["Tên Thiết Bị"] || "",
                manufacturer: row["Nhà Sản Xuất"] || "",
                serial: row["Serial"] || "",
                status: row["Trạng Thái"] || "Lưu kho",
                specs: {
                  processor: row["Bộ Xử Lý (Processor)"] || "",
                  ram: row["RAM"] || "",
                  storage: row["Bộ Nhớ (Storage)"] || "",
                  display: row["Màn Hình (Display)"] || "",
                },
                assigned: row["Người Dùng (User ID)"] ? [row["Người Dùng (User ID)"]] : [],
              }));
          
              console.log("Dữ liệu đã chuẩn hóa:", normalizedData);
              setParsedData(normalizedData);
            };
          
            reader.readAsBinaryString(file);
          };
          

          const handleConfirmUpload = async () => {
              try {
                const token = localStorage.getItem("authToken");
                const response = await axios.post(
                  "http://localhost:5001/api/laptops/bulk-upload",
                  { laptops: parsedData }, // Thay `parsedData` bằng dữ liệu từ file Excel
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
            
                if (response.status === 201) {
                  toast.success("Dữ liệu đã được tải lên thành công!", {
                    position: "top-center",
                    autoClose: 2000,
                  });
                  setShowUploadModal(false); // Đóng modal sau khi thành công
                  fetchLaptops(); // Refresh danh sách laptop
                }
              } catch (error) {
                console.error("Lỗi khi tải dữ liệu lên:", error);
                toast.error("Tải dữ liệu lên thất bại. Vui lòng kiểm tra lại file.", {
                  position: "top-center",
                  autoClose: 2000,
                });
              }
          };

          useEffect(() => {
            const fetchData = async () => {
              try {
                await fetchLaptops();
                await fetchUsers();
              } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
              }
            };
            fetchData();
            }, []);

  return (  
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
            <div className="relative w-100">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm laptop..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const query = e.target.value.toLowerCase();
                    if (query === "") {
                      // Nếu ô tìm kiếm rỗng, khôi phục dữ liệu gốc
                      fetchLaptops();
                    } else {
                      const filteredData = data.filter((item) =>
                        item.name.toLowerCase().includes(query) ||
                        item.manufacturer.toLowerCase().includes(query) ||
                        item.serial.toLowerCase().includes(query)
                    );
                    setData(filteredData); // Cập nhật danh sách được hiển thị
                  }
                }}
                />
            </div>   
            <div className="flex space-x-2">  
        <button
          onClick={() => {
            setNewLaptop({
              name: "",
              manufacturer: "",
              serial: "",
              assigned: [],
              status: "Active",
            }); // Reset lại form
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-[#002147] text-white rounded-lg shadow-md hover:bg-[#001a38]"
        >
          Thêm mới
        </button>

        <button
          className="bg-[#FF5733] text-white px-4 py-2 rounded-md hover:bg-[#FF5733]"
          onClick={() => setShowUploadModal(true)}
        >
          Upload
        </button>
        </div>   
      </div>

      {/* {-----------------------------------------/* Modal thêm mới /-----------------------------------------} */}
      {showAddModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 space-y-6"
                onClick={() => setShowAddModal(false)}
              >
                <div
                  className="bg-white rounded-lg shadow-lg p-6 w-[50%]"
                  onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
                >
                  <h3 className="text-2xl font-bold mb-6 text-[#002147]">Thêm mới laptop</h3>
                  <form onSubmit={handleAddLaptop}>
                    {/* Thông tin chung */}
                    <div
                      className="border rounded-lg p-4 mb-4 relative"
                      style={{ position: "relative", padding: "16px", marginBottom: "30px" }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "-12px",
                          left: "16px",
                          backgroundColor: "#fff",
                          padding: "0 8px",
                          fontWeight: "bold",
                          color: "#002147",
                        }}
                      >
                        Thông tin chung
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Tên thiết bị</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập tên thiết bị"
                            value={newLaptop.name}
                            onChange={(e) => setNewLaptop({ ...newLaptop, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Nhà sản xuất</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập nhà sản xuất"
                            value={newLaptop.manufacturer}
                            onChange={(e) => setNewLaptop({ ...newLaptop, manufacturer: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Serial</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập số serial"
                            value={newLaptop.serial}
                            onChange={(e) => setNewLaptop({ ...newLaptop, serial: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Năm sản xuất</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập năm sản xuất"
                            value={newLaptop.releaseYear}
                            onChange={(e) => setNewLaptop({ ...newLaptop, releaseYear: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cấu hình */}
                    <div
                      className="border rounded-lg p-4 mb-4 relative"
                      style={{ position: "relative", padding: "16px", marginBottom: "30px" }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "-12px",
                          left: "16px",
                          backgroundColor: "#fff",
                          padding: "0 8px",
                          fontWeight: "bold",
                          color: "#002147",
                          marginBottom: "16px"
                        }}
                      >
                        Cấu hình
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Processor</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập bộ xử lý"
                            value={newLaptop.specs?.processor || ""}
                            onChange={(e) =>
                              setNewLaptop({ ...newLaptop, specs: { ...newLaptop.specs, processor: e.target.value } })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">RAM</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập dung lượng RAM"
                            value={newLaptop.specs?.ram || ""}
                            onChange={(e) =>
                              setNewLaptop({ ...newLaptop, specs: { ...newLaptop.specs, ram: e.target.value } })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Bộ Nhớ</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập dung lượng Bộ nhớ"
                            value={newLaptop.specs?.storage || ""}
                            onChange={(e) =>
                              setNewLaptop({ ...newLaptop, specs: { ...newLaptop.specs, storage: e.target.value } })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Màn hình</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            placeholder="Nhập kích thước màn hình"
                            value={newLaptop.specs?.display || ""}
                            onChange={(e) =>
                              setNewLaptop({ ...newLaptop, specs: { ...newLaptop.specs, display: e.target.value } })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trạng thái */}
                    <div
                      className="border rounded-lg p-4 mb-4 relative"
                      style={{ position: "relative", padding: "16px", marginBottom: "16px" }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "-12px",
                          left: "16px",
                          backgroundColor: "#fff",
                          padding: "0 8px",
                          fontWeight: "bold",
                          color: "#002147",
                          marginBottom: "16px"
                        }}
                      >
                        Trạng thái
                      </span>
                      <select
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                        value={newLaptop.status}
                        onChange={(e) => setNewLaptop({ ...newLaptop, status: e.target.value })}
                      >
                        <option value="Active">Đang sử dụng</option>
                        <option value="In Repair">Chờ sửa chữa</option>
                        <option value="Lưu kho">Lưu kho</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#002147] text-white rounded"
                      >
                        Lưu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          )}

      {/* {-----------------------------------------/* Modal upload /-----------------------------------------} */}
      {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-md shadow-md w-1/3">
                    <h2 className="text-2xl font-bold mb-4 text-center text-[#002147]">Cập nhật dữ liệu</h2>
                    <form>
                      <div className="mb-4">
                        <label className="block text-base font-medium mb-2">Chọn file Excel</label>
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          className="block w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 focus:outline-none"
                          onChange={handleFileChange}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <a
                          href="/sample-template.xlsx"
                          download
                          className="bg-[#002147] text-white px-4 py-2 rounded-md hover:bg-[#001635]"
                        >
                          Tải file mẫu
                        </a>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="bg-[#FF5733] text-white px-4 py-2 rounded-md"
                            onClick={() => setShowUploadModal(false)}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            className="bg-[#002147] text-white px-4 py-2 rounded-md"
                            onClick={handleConfirmUpload}
                          >
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
          )}
      {/* {-----------------------------------------/* Modal cập nhật thông tin /-----------------------------------------} */}
      {showEditModal && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 space-y-6"
              onClick={() => setShowEditModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-lg p-6 w-[50%]"
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
              >
                <h3 className="text-2xl font-semibold mb-8 text-[#002147]">Cập nhật thông tin Laptop</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const payload = {
                        ...editingLaptop,
                        releaseYear: editingLaptop.releaseYear || "",
                        specs: {
                          processor: editingLaptop.specs?.processor || "",
                          ram: editingLaptop.specs?.ram || "",
                          storage: editingLaptop.specs?.storage || "",
                          display: editingLaptop.specs?.display || "",
                        },
                        assigned:
                            editingLaptop.assigned.length > 0
                              ? editingLaptop.assigned.map((user) => user.value)
                              : selectedLaptop.assigned.map((user) => user.value),
                        };
                      
                        console.log("Payload gửi lên server:", payload);

                      await axios.put(
                        `http://localhost:5001/api/laptops/${editingLaptop._id}`,
                        payload,
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                          },
                        }
                      );
                      setShowEditModal(false);
                      fetchLaptops(); // Cập nhật danh sách sau khi sửa
                      toast.success("Cập nhật laptop thành công!", {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                      });
                    } catch (error) {
                      console.error("Error updating laptop:", error);
                      toast.error("Không thể cập nhật laptop!", {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                      });
                    }
                  }}
                >
                  {/* Thông tin chung */}
                  <div className="border rounded-lg p-4 mb-4 relative"
                  style={{ position: "relative", padding: "16px", marginBottom: "30px" }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "16px",
                        backgroundColor: "#fff",
                        padding: "0 8px",
                        fontWeight: "bold",
                        color: "#002147",
                      }}
                    >
                      Thông tin chung
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">Tên thiết bị</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập tên thiết bị"
                          value={editingLaptop.name}
                          onChange={(e) => setEditingLaptop({ ...editingLaptop, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">Nhà sản xuất</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập nhà sản xuất"
                          value={editingLaptop.manufacturer}
                          onChange={(e) => setEditingLaptop({ ...editingLaptop, manufacturer: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">Serial</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập số serial"
                          value={editingLaptop.serial}
                          onChange={(e) => setEditingLaptop({ ...editingLaptop, serial: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">Năm sản xuất</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập năm sản xuất"
                          value={editingLaptop.releaseYear}
                          onChange={(e) => setEditingLaptop({ ...editingLaptop, releaseYear: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cấu hình */}
                  <div className="border rounded-lg p-4 mb-4 relative"
                  style={{ position: "relative", padding: "16px", marginBottom: "30px" }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "16px",
                        backgroundColor: "#fff",
                        padding: "0 8px",
                        fontWeight: "bold",
                        color: "#002147",
                      }}
                    >
                      Cấu hình
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">Processor</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập bộ xử lý"
                          value={editingLaptop.specs?.processor || ""}
                          onChange={(e) =>
                            setEditingLaptop({ ...editingLaptop, specs: { ...editingLaptop.specs, processor: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">RAM</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập dung lượng RAM"
                          value={editingLaptop.specs?.ram || ""}
                          onChange={(e) =>
                            setEditingLaptop({ ...editingLaptop, specs: { ...editingLaptop.specs, ram: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">Bộ Nhớ</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập dung lượng bộ nhớ"
                          value={editingLaptop.specs?.storage || ""}
                          onChange={(e) =>
                            setEditingLaptop({ ...editingLaptop, specs: { ...editingLaptop.specs, storage: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-medium mb-2">Màn hình</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                          placeholder="Nhập kích thước màn hình"
                          value={editingLaptop.specs?.display || ""}
                          onChange={(e) =>
                            setEditingLaptop({ ...editingLaptop, specs: { ...editingLaptop.specs, display: e.target.value } })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trạng thái */}
                    <div
                      className="border rounded-lg p-4 mb-8 relative"
                      style={{ position: "relative", padding: "16px", marginBottom: "30px" }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "-12px",
                          left: "16px",
                          backgroundColor: "#fff",
                          padding: "0 8px",
                          fontWeight: "bold",
                          color: "#002147",
                        }}
                      >
                        Trạng thái
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Tình trạng</label>
                          <select
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                            value={editingLaptop.status}
                            onChange={(e) => setEditingLaptop({ ...editingLaptop, status: e.target.value })}
                          >
                            <option value="Active">Đang sử dụng</option>
                            <option value="In Repair">Chờ sửa chữa</option>
                            <option value="Lưu kho">Lưu kho</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-2">Người sử dụng</label>
                          <input
                              type="text"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
                              placeholder="Nhập tên người sử dụng"
                              value={editingLaptop.assigned[0]?.label || ""}
                              onChange={(e) => {
                                const query = e.target.value.toLowerCase();
                                setFilteredUsers(
                                  users.filter((user) =>
                                    user.label.toLowerCase().includes(query)
                                  )
                                );
                                setShowSuggestions(true);
                                setEditingLaptop({
                                  ...editingLaptop,
                                  assigned: [{ label: e.target.value, value: null }],
                                });
                              }}
                              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Đợi để chọn gợi ý
                            />
                          {showSuggestions && filteredUsers.length > 0 && (
                            <ul className="border rounded-lg mt-2 bg-white shadow-lg max-h-40 overflow-y-auto">
                              {filteredUsers.map((user) => (
                                <li
                                  key={user.value}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setEditingLaptop({ ...editingLaptop, assigned: [user] });
                                    setShowSuggestions(false);
                                  }}
                                >
                                  {user.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#002147] text-white rounded"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
      {/* {-----------------------------------------/* Modal confirm /-----------------------------------------} */}
      {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h3 className="text-lg text-center font-semibold mb-4 text-[#002147]">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa laptop <strong>{laptopToDelete?.name}</strong> không?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-[#002147] text-white rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-[#FF5733] text-white rounded hover:bg-[#cc4529] transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
          )}
      {/* {-----------------------------------------/* Modal click thiết bị /-----------------------------------------} */}
      {showDetailModal && selectedLaptop && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-4xl">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowDetailModal(false)} // Đóng modal
              >
                ✕
              </button>
              <ITProductCard
                laptopData={{
                  ...selectedLaptop,
                  releaseYear: selectedLaptop.releaseYear || "Không có",
                }}
                onAddRepair={handleAddRepair} // Truyền hàm vào đây
                onDeleteRepair={handleDeleteRepair}
              />
            </div>
          </div>
        )}
      {/* {-----------------------------------------/* Bảng /-----------------------------------------} */}
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-[#002147] border-collapse rounded-lg text-white">
          <tr>
            <th className="px-4 py-2 text-center">Tên Thiết Bị</th>
            <th className="px-4 py-2 text-center">Nhà sản xuất</th>
            <th className="px-4 py-2 text-center">Serial</th>
            <th className="px-4 py-2 text-center">Người sử dụng</th>
            <th className="px-4 py-2 text-center">Trạng thái</th>
            <th className="px-4 py-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
             {data.length > 0 ? (
             data.map((item) => (
                <tr key={item._id} className="px-4 py-2 items-center font-semibold hover:bg-gray-50 border-b">
                      <td
                        onClick={() => handleViewDetails(item)} // Gọi hàm để mở modal
                        className="cursor-pointer text-[#002147] hover:underline items-center text-left whitespace-nowrap px-4"
                      >
                        {item.name}
                      </td>
                    <td className="px-4 py-2 text-center">{item.manufacturer}</td>
                    <td className="px-4 py-2 text-center">{item.serial}</td>
                    <td className="px-4 py-2 text-center">
                      {Array.isArray(item.assigned) && item.assigned.length > 0
                        ? item.assigned.map((user) => (
                            <span
                              key={user.value || user._id}
                              className="bg-gray-100 px-2 py-1 rounded-full text-sm mr-1"
                            >
                              {user.label || user.name}
                            </span>
                          ))
                        : "Không có"}
                    </td>
                    <td className="px-4 py-2 text-center">
                    <span
                           className={`px-2 py-1 rounded-full text-xs font-semibold text-center ${
                           item.status === "Active"
                           ? "bg-green-100 text-green-800"
                           : item.status === "In Repair"
                           ? "bg-yellow-100 text-yellow-800"
                           : item.status === "Lưu kho"
                           ? "bg-red-600 text-white"
                           : "bg-gray-100 text-gray-700"
                    }`}
                   >
                      {item.status === "Active"
                        ? "Đang sử dụng"
                        : item.status === "In Repair"
                        ? "Chờ sửa chữa"
                        : item.status === "Lưu kho"
                        ? "Lưu kho"
                        : "Không xác định"}
                    </span>
                  </td>


                {/* Cột Actions */}
                  <td className="px-1 py-1 space-x-2 text-center">
                {/* Nút cập nhật */}
                              <button
                                onClick={() => handleEdit(item)}
                                className="ml-2 px-1 py-1 bg-[#002147] text-white text-sm rounded-lg shadow-md hover:bg-[#001a38] transition"
                              >
                                <FiEdit size={16} />
                              </button>
                {/* Nút xóa */}
                              <button
                                onClick={() => confirmDelete(item)}
                                className="ml-2 px-1 py-1 bg-[#FF5733] text-white text-sm rounded-lg shadow-md hover:bg-[#cc4529] transition"
                              >
                                <FiTrash2 size={16} />
                              </button>
                              </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default LaptopTable;