// routes/rumah.js
const express = require("express");
const router = express.Router();
const rumahController = require("../controllers/rumahController");
const { auth } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// Public reads
router.get("/", rumahController.getAllRumah);
router.get("/:id", rumahController.getRumahById);

// Protected (Admin + Senior Leader)
// Note: rumahController sudah mengekspos upload middleware di dalamnya (multer)
router.post("/", auth, allowRoles("admin", "senior_leader"), rumahController.createRumah);
router.put("/:id", auth, allowRoles("admin", "senior_leader"), rumahController.updateRumah);
router.delete("/:id", auth, allowRoles("admin", "senior_leader"), rumahController.deleteRumah);

module.exports = router;
