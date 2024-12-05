const Laptop = require("../models/Laptop");
const User = require("../models/Clients");

// Lấy danh sách laptop
exports.getLaptops = async (req, res) => {
  try {
    const laptops = await Laptop.find().lean();
    console.log("Laptops:", laptops); // Log để kiểm tra dữ liệu

    const populatedLaptops = await Promise.all(
      laptops.map(async (laptop) => {
        const assignedArray = Array.isArray(laptop.assigned) ? laptop.assigned : [];
        const assignedUsers = await User.find({ _id: { $in: assignedArray } })
        const assignedFormatted = assignedUsers.map((user) => ({
             _id: user._id,
            name: user.name,
        jobTitle: user.jobTitle, // Đảm bảo jobTitle có trong model Clients
        }));

        return { ...laptop, assigned: assignedFormatted };
      })
    );

    res.status(200).json(populatedLaptops);
  } catch (error) {
    console.error("Error fetching laptops:", error.message); // Log lỗi
    res.status(500).json({ message: "Error fetching laptops", error: error.message });
  }
};

// Thêm mới laptop
exports.createLaptop = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log dữ liệu nhận từ frontend

    const { name, manufacturer, serial, assigned, status, specs } = req.body;

    if (!name || !manufacturer || !serial) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    if (!specs || typeof specs !== "object") {
      return res.status(400).json({ message: "Thông tin specs không hợp lệ!" });
    }


    // Kiểm tra nếu `assigned` không phải là mảng hoặc có ID không hợp lệ
    if (assigned && !Array.isArray(assigned)) {
      return res.status(400).json({ message: "Assigned phải là mảng ID người sử dụng hợp lệ." });
    }

    const laptop = new Laptop({ name, manufacturer, serial, assigned, specs, status });
    await laptop.save();

    res.status(201).json(laptop);
  } catch (error) {
    console.error("Error creating laptop:", error.message);
    res.status(500).json({ message: "Lỗi khi thêm laptop", error: error.message });
  }
};

exports.updateLaptop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, manufacturer, serial, assigned, status, releaseYear, specs } = req.body;

    // Kiểm tra nếu `assigned` không phải là mảng hoặc có ID không hợp lệ
    if (assigned && !Array.isArray(assigned)) {
      return res.status(400).json({ message: "Assigned phải là mảng ID người sử dụng hợp lệ." });
    }

    const laptop = await Laptop.findByIdAndUpdate(
      id,
      { name, manufacturer, serial, assigned, status, releaseYear, specs  },
      { new: true } // Trả về tài liệu đã cập nhật
    );

    if (!laptop) {
      return res.status(404).json({ message: "Không tìm thấy laptop" });
    }

    res.json(laptop);
  } catch (error) {
    console.error("Error updating laptop:", error.message);
    res.status(400).json({ message: "Error updating laptop", error: error.message });
  }
};

// Xóa laptop
exports.deleteLaptop = async (req, res) => {
  try {
    await Laptop.findByIdAndDelete(req.params.id);
    res.json({ message: "Laptop deleted" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting laptop", error });
  }
};

exports.bulkUploadLaptops = async (req, res) => {
  try {
    const { laptops } = req.body;

    if (!Array.isArray(laptops) || laptops.length === 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }

    // Kiểm tra từng đối tượng và lọc ra các laptop hợp lệ
    const validLaptops = laptops.filter(
      (laptop) =>
        laptop.name &&
        laptop.manufacturer &&
        laptop.serial &&
        laptop.status &&
        typeof laptop.specs === "object"
    );

    if (validLaptops.length === 0) {
      return res.status(400).json({ message: "Không có laptop nào hợp lệ để thêm mới!" });
    }

    // Thêm mới các laptop hợp lệ
    await Laptop.insertMany(validLaptops);
    res.status(201).json({ message: "Thêm mới hàng loạt thành công!", validLaptops });
  } catch (error) {
    console.error("Bulk upload error:", error.message);
    res.status(500).json({ message: "Lỗi khi thêm mới hàng loạt", error: error.message });
  }
};

exports.addRepairLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, date, updatedBy } = req.body; // Lấy thông tin từ request

    const repairLog = { description, date, updatedBy };

    const laptop = await Laptop.findById(id);
    if (!laptop) {
      return res.status(404).json({ message: "Laptop not found" });
    }

    laptop.repairs.push(repairLog); // Thêm nhật ký sửa chữa
    await laptop.save(); // Lưu thay đổi vào cơ sở dữ liệu

    res.status(201).json(repairLog); // Trả về nhật ký sửa chữa vừa được thêm
  } catch (error) {
    console.error("Error adding repair log:", error);
    res.status(500).json({ message: "Failed to add repair log" });
  }
};

