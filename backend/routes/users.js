const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const userController = require("../controllers/userController");

router.get("/", userController.getUsers); // Lấy danh sách người dùng
router.post("/", userController.createUser); // Thêm người dùng mới
router.put("/:id", userController.updateUser); // Cập nhật người dùng
router.delete("/:id", userController.deleteUser); // Xóa người dùng

// Lấy danh sách người dùng
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Loại bỏ password khỏi kết quả trả về
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// Thêm người dùng mới
router.post("/", async (req, res) => {
  const { fullname, username, password, role } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!fullname || !username || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newUser = new User({ fullname, username, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(400).json({ message: "Error adding user", error });
  }
});

// Cập nhật người dùng
router.put("/:id", async (req, res) => {
  const { fullname, username, role } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!fullname || !username || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullname, username, role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(400).json({ message: "Error updating user", error });
  }
});

// Xóa người dùng
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: "User deleted." });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(400).json({ message: "Error deleting user", error });
  }
});

module.exports = router;