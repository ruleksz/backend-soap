const cabuyService = require("../services/cabuyService");

// GET ALL
exports.getAllCabuy = async (req, res) => {
  try {
    const data = await cabuyService.getAll(req.user);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY AGENT
exports.getCabuyByAgent = async (req, res) => {
  try {
    const data = await cabuyService.getByAgent(req.user);
    res.json({ data });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

// GET FOR SENIOR
exports.getCabuyForSenior = async (req, res) => {
  try {
    const data = await cabuyService.getForSenior(req.user);

    res.json({
      message: "Berhasil mengambil data cabuy senior leader",
      data,
    });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

// GET BY ID
exports.getCabuyById = async (req, res) => {
  try {
    const data = await cabuyService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// CREATE
exports.createCabuy = async (req, res) => {
  try {
    const data = await cabuyService.create(req.body);

    res.status(201).json({
      message: "Cabuy berhasil dibuat",
      data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.updateCabuy = async (req, res) => {
  try {
    const data = await cabuyService.update(
      req.params.id,
      req.body
    );

    res.json({
      message: "Cabuy berhasil diupdate",
      data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteCabuy = async (req, res) => {
  try {
    await cabuyService.remove(req.params.id);

    res.json({
      message: "Cabuy berhasil dihapus",
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};