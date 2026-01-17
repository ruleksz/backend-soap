const express = require("express");
const router = express.Router();
const controller = require("../controllers/propertiController");
const multer = require("multer");

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

router.get("/", controller.getAllProperti);
router.get("/:id", controller.getPropertiById);

router.post("/", upload.single("image"), controller.createProperti);
router.put("/:id", upload.single("image"), controller.updateProperti);

router.delete("/:id", controller.deleteProperti);

module.exports = router;
