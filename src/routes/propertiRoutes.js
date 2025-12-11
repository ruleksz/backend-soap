// routes/properti.js
const express = require("express");
const router = express.Router();
const propertiController = require("../controllers/propertiController");
const { auth } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// Public reads
router.get("/", propertiController.getAllProperti);
router.get("/:id", propertiController.getPropertiById);

// Protected (Admin + Senior Leader)
router.post("/", auth, allowRoles("admin", "senior_leader"), propertiController.createProperti);
router.put("/:id", auth, allowRoles("admin", "senior_leader"), propertiController.updateProperti);
router.delete("/:id", auth, allowRoles("admin", "senior_leader"), propertiController.deleteProperti);

module.exports = router;
