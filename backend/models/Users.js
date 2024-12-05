const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullname: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  disabled: { type: Boolean, default: false },
});

// Middleware: Hash mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
    console.log("Middleware pre-save được gọi với mật khẩu:", this.password);
  
    if (!this.isModified("password")) {
      console.log("Mật khẩu không thay đổi, bỏ qua mã hóa");
      return next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  
    console.log("Mật khẩu sau khi mã hóa:", this.password);
    next();
  });

// Phương thức kiểm tra mật khẩu
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);