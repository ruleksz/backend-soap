const express = require("express");
const router = express.Router();
const crmController = require("../controllers/crmController");
const { auth } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.get("/", auth, crmController.getAllCrm);

router.post(
    "/from-survey/:id_survey",
    auth,
    upload.single("gambar"),
    crmController.createFromSurvey
);

router.put("/:id", auth, crmController.updateStatus);

module.exports = router;
