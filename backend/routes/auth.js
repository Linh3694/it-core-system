const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateToken = require("../middleware/validateToken"); 

async function hashPasswords() {
  const users = await User.find({});
  for (const user of users) {
    if (!user.password.startsWith("$2a$")) { // Kiểm tra nếu chưa mã hóa
      user.password = await bcrypt.hash(user.password, 10);
      await user.save();
      console.log(`Mã hóa mật khẩu cho người dùng: ${user.username}`);
    }
  }
  console.log("Hoàn tất mã hóa mật khẩu.");
}

hashPasswords();
// API đăng nhập
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Thông tin đăng nhập:", username, password);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("Người dùng không tồn tại");
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Kết quả so sánh mật khẩu:", isMatch);

    if (!isMatch) {
      console.log("Mật khẩu không đúng");
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });
    }

    // Tạo JWT token
    const jwtSecret = process.env.JWT_SECRET || 'wellspring';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '8h' }
    );

    // Trả về thông tin người dùng và token
    res.status(200).json({
      message: 'Đăng nhập thành công',
      user: {
          id: user._id,
          username: user.username,
          role: user.role,
          fullname: user.fullname,
      },
      token, // Đưa token vào response
     });

  } catch (error) {
    console.log("Lỗi server:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// module.exports = router ; //

module.exports = {
  router,
  validateToken,
};