const User = require("../models/Users"); // Import model User

// Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Không trả về password để bảo mật
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Thêm người dùng mới
exports.createUser = async (req, res) => {
  const { fullname, username, password, role } = req.body;

  // Kiểm tra thông tin bắt buộc
  if (!fullname || !username || !password || !role) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }

  try {
    const newUser = new User({ fullname, username, password, role });
    await newUser.save();
    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(400).json({ message: "Error creating user", error: error.message });
  }
};

// Cập nhật người dùng
exports.updateUser = async (req, res) => {
    const { fullname, username, role } = req.body;
  
    if (!fullname || !username || !role) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { fullname, username, role },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy user." });
      }
  
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi cập nhật user", error: error.message });
    }
  };

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(400).json({ message: "Error deleting user", error: error.message });
  }
};