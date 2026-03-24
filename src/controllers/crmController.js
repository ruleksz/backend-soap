const crmService = require("../services/crmService");

// GET ALL CRM
exports.getAllCrm = async (req, res) => {
    try {
        const data = await crmService.getAll(req.user);

        res.json({
            success: true,
            message: "Data CRM berhasil diambil",
            data,
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: error.message,
        });
    }
};

// CREATE FROM SURVEY
exports.createFromSurvey = async (req, res) => {
    try {
        const data = await crmService.createFromSurvey(
            req.params.id_survey,
            req.body,
            req.user,
            req.file
        );

        res.status(201).json({
            message: "CRM berhasil dibuat dari survey",
            data,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

// UPDATE STATUS
exports.updateStatus = async (req, res) => {
    try {
        const data = await crmService.updateStatus(
            req.params.id,
            req.body,
            req.user
        );

        res.json({
            message: "Status CRM berhasil diperbarui",
            data,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};