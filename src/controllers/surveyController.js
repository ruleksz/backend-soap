const surveyService = require("../services/surveyService");

// GET ALL
exports.getAllSurvey = async (req, res) => {
    try {
        const data = await surveyService.getAll();

        res.json({
            success: true,
            message: "Data survey berhasil diambil",
            data,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// GET BY ID
exports.getSurveyById = async (req, res) => {
    try {
        const data = await surveyService.getById(req.params.id);

        res.json({
            success: true,
            data,
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            message: err.message,
        });
    }
};

// GET BY LEADER
exports.getSurveyByLeader = async (req, res) => {
    try {
        const data = await surveyService.getByLeader(
            req.params.id_member
        );

        res.json({
            success: true,
            message: "Jadwal survey leader berhasil diambil",
            data,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// UPDATE STATUS
exports.updateSurveyStatus = async (req, res) => {
    try {
        const data = await surveyService.updateStatus(
            req.params.id,
            req.body.status_survey
        );

        res.json({
            success: true,
            message: "Status survey berhasil diperbarui",
            data,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// CREATE
exports.createSurvey = async (req, res) => {
    try {
        const data = await surveyService.create(req.body);

        res.status(201).json({
            success: true,
            message: "Data survey berhasil ditambahkan",
            data,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// UPDATE
exports.updateSurvey = async (req, res) => {
    try {
        const data = await surveyService.update(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Data survey berhasil diperbarui",
            data,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// DELETE
exports.deleteSurvey = async (req, res) => {
    try {
        await surveyService.remove(req.params.id);

        res.json({
            success: true,
            message: "Data survey berhasil dihapus",
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            message: err.message,
        });
    }
};