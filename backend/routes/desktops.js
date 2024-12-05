const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Danh sách desktops");
});

router.post("/", (req, res) => {
  res.send("Thêm desktop");
});

module.exports = router;