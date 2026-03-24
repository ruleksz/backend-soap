const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/authMiddleware");
const memberDashboardController = require("../controllers/memberDashboardController");

// GET /api/admin/dashboard
router.get(
    "/",
    auth,
    memberDashboardController.getMemberDashboardStats
);

module.exports = router;