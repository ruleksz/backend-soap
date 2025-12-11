// routes/cabuy.js
const express = require("express");
const router = express.Router();
const cabuyController = require("../controllers/cabuyController");

// GET semua cabuy
router.get("/", cabuyController.getCabuy);

// GET cabuy by id
router.get("/:id", cabuyController.getCabuyById);

// POST buat cabuy baru
router.post("/", cabuyController.createCabuy);

// PUT update cabuy
router.put("/:id", cabuyController.updateCabuy);

// DELETE hapus cabuy
router.delete("/:id", cabuyController.deleteCabuy);

module.exports = router;