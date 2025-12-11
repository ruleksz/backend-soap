// routes/auth.js
const express = require("express");
const router = express.Router();

const { unifiedLogin } = require("../controllers/authController");

// Satu endpoint login gabungan
router.post("/login", unifiedLogin);

module.exports = router;
