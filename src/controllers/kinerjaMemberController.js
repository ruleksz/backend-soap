const kinerjaService = require("../services/kinerjaService");

// GET ALL
exports.getAllKinerja = async (req, res) => {
    try {
        const data = await kinerjaService.getAll();

        res.json({
            success: true,
            message: "Data kinerja member berhasil diambil",
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET BY ID
exports.getKinerjaById = async (req, res) => {
    try {
        const data = await kinerjaService.getById(req.params.id);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// CREATE
exports.createKinerja = async (req, res) => {
    try {
        const data = await kinerjaService.create(req.body);

        res.status(201).json({
            success: true,
            message: "Kinerja member berhasil ditambahkan",
            data,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE
exports.updateKinerja = async (req, res) => {
    try {
        const data = await kinerjaService.update(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Data kinerja member berhasil diperbarui",
            data,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE
exports.deleteKinerja = async (req, res) => {
    try {
        await kinerjaService.remove(req.params.id);

        res.json({
            success: true,
            message: "Kinerja member berhasil dihapus",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};