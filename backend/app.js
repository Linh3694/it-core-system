const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const laptopRoutes = require("./routes/laptops");
const userRoutes = require("./routes/users");
const clientRoutes = require("./routes/clients");
const jwt = require("jsonwebtoken");
const validateToken = require("./middleware/validateToken");
const clientsSync = require('./routes/clientsSync').router;

const Laptop = require("./models/Laptop");

// Load biến môi trường
require("dotenv").config();

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

// Tạo app Express
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/laptops", require("./routes/laptops"));

// Routes
app.use("/api/auth", authRoutes.router); // Route xác thực
app.use("/api/laptops", laptopRoutes); // Route laptops
app.use("/api/users", userRoutes); // Route users
app.use("/api/clients", validateToken, clientRoutes.router);
app.use("/api", clientsSync);


const syncClientsFromAzure = require("./routes/clientsSync");
app.get("/api/sync-clients", async (req, res) => {
  try {
    await syncClientsFromAzure();
    res.json({ message: "Clients synced successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error syncing clients" });
  }
});
app.post("/api/sync-clients", validateToken, async (req, res) => {
  try {
    await syncClientsFromAzure();
    res.json({ message: "Clients synced successfully!" });
  } catch (error) {
    console.error("Error syncing clients:", error.message);
    res.status(500).json({ error: "Error syncing clients" });
  }
});

const cron = require("node-cron");


cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled client sync...");
  await syncClientsFromAzure();
});

app.post("/api/laptops/bulk-upload", async (req, res) => {
  try {
    const laptops = req.body.laptops;

    // Kiểm tra dữ liệu đầu vào
    if (!laptops || !Array.isArray(laptops)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Xác minh từng laptop
    const invalidLaptops = laptops.filter(
      (laptop) =>
        !laptop.name || !laptop.manufacturer || !laptop.serial || !laptop.status
    );

    if (invalidLaptops.length > 0) {
      return res.status(400).json({
        message: "Có laptop không hợp lệ, kiểm tra lại dữ liệu!",
        invalidLaptops,
      });
    }

    // Lưu dữ liệu hợp lệ
    await Laptop.insertMany(laptops);
    res.status(201).json({ message: "Tải dữ liệu lên thành công!" });
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu lên:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
});

// Khởi động server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});