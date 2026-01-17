const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/authMiddleware");
const {
    getMembers,
    createMember,
    loginMember,
    updateMember,
    deleteMember,
    getLeadersMembersCabuys,
    getSeniorLeaders,
    getLeadersBySenior
} = require("../controllers/memberController");

// 🔹 Login member
router.post("/login", loginMember);

// 🔹 Get all members (protected)
router.get("/", auth, getMembers);

router.get("/senior", auth, getSeniorLeaders);

router.get("/leaders", auth, getLeadersBySenior)

router.get("/leaders-members-cabuys", auth, getLeadersMembersCabuys);

// 🔹 Create member (protected)
router.post("/", auth, createMember);

// 🔹 Update member by ID (protected)
router.put("/:id", auth, updateMember);

// 🔹 Delete member by ID (protected)
router.delete("/:id", auth, deleteMember);

module.exports = router;
