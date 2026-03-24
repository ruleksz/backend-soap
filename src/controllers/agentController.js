const agentService = require("../services/agentService");

// GET ALL
exports.getAllAgents = async (req, res) => {
    try {
        const data = await agentService.getAll();
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET BY ID
exports.getAgentById = async (req, res) => {
    try {
        const agent = await agentService.getById(req.params.id);
        res.json(agent);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// CREATE
exports.createAgent = async (req, res) => {
    try {
        const data = await agentService.create(req.body);

        res.status(201).json({
            message: "Agent berhasil ditambahkan",
            data,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// UPDATE
exports.updateAgent = async (req, res) => {
    try {
        const data = await agentService.update(
            req.params.id,
            req.body
        );

        res.json({
            message: "Agent berhasil diperbarui",
            data,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
exports.deleteAgent = async (req, res) => {
    try {
        await agentService.remove(req.params.id);

        res.json({
            message: "Agent berhasil dihapus",
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};