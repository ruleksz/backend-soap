const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/authMiddleware");

const cabuyController = require("../controllers/cabuyController");

const {
    createCabuy,
    getCabuyByAgent,
    getCabuyForSenior,
    getAllCabuy,
    getCabuyById,
    updateCabuy,
    deleteCabuy,
} = cabuyController;

// ================= ROUTES =================

// CREATE
router.post("/", createCabuy);

// READ
router.get("/", auth, getAllCabuy);
router.get("/my-leads", auth, getCabuyByAgent);
router.get("/senior", auth, getCabuyForSenior);
router.get("/:id", auth, getCabuyById);

// UPDATE
router.put("/:id", auth, updateCabuy);

// DELETE
router.delete("/:id", auth, deleteCabuy);

module.exports = router;
