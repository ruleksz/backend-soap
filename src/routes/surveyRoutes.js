const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

// LEADER
router.get("/leader/:id_member", surveyController.getSurveyByLeader);
router.put("/:id/status", surveyController.updateSurveyStatus);

// ADMIN
router.get("/", surveyController.getAllSurvey);
router.get("/:id", surveyController.getSurveyById);
router.post("/", surveyController.createSurvey);
router.put("/:id", surveyController.updateSurvey);
router.delete("/:id", surveyController.deleteSurvey);

module.exports = router;
