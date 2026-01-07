const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/authMiddleware");
const { getAdminDashboardStats } = require("../controllers/dashboardController");

// GET /api/admin/dashboard
router.get("/", auth, getAdminDashboardStats);

module.exports = router;