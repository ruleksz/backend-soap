const propertiService = require("../services/propertiService");

// GET ALL
exports.getAllProperti = async (req, res) => {
  try {
    const data = await propertiService.getAll();

    res.json({
      success: true,
      message: "Data properti berhasil diambil",
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
exports.getPropertiById = async (req, res) => {
  try {
    const data = await propertiService.getById(req.params.id);

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

// CREATE
exports.createProperti = async (req, res) => {
  try {
    const data = await propertiService.create(
      req.body,
      req.file
    );

    res.status(201).json({
      success: true,
      message: "Properti berhasil ditambahkan",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE
exports.updateProperti = async (req, res) => {
  try {
    const data = await propertiService.update(
      req.params.id,
      req.body,
      req.file
    );

    res.json({
      success: true,
      message: "Properti berhasil diperbarui",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE
exports.deleteProperti = async (req, res) => {
  try {
    await propertiService.remove(req.params.id);

    res.json({
      success: true,
      message: "Properti berhasil dihapus",
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};