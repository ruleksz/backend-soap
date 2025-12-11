// routes/admin.js
const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

const {
    getAdmins,
    registerAdmin,
    loginAdmin,
    updateAdmin,
    deleteAdmin,
} = require("../controllers/adminController");

// Login admin → tidak perlu auth
router.post("/login", loginAdmin);

// Register admin baru (HANYA ADMIN YANG SUDAH LOGIN)
router.post("/register", auth, allowRoles("admin"), registerAdmin);

// Get semua admin (HANYA ADMIN)
router.get("/", auth, allowRoles("admin"), getAdmins);

// Update admin (HANYA ADMIN)
router.put("/:id", auth, allowRoles("admin"), updateAdmin);

// Hapus admin (HANYA ADMIN)
router.delete("/:id", auth, allowRoles("admin"), deleteAdmin);

module.exports = router;
