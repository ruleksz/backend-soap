const rumahService = require("../services/rumahService");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET ALL
exports.getAllRumah = async (req, res) => {
  try {
    const data = await rumahService.getAll();

    res.json({
      success: true,
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
exports.getRumahById = async (req, res) => {
  try {
    const data = await rumahService.getById(req.params.id);

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
exports.createRumah = [
  upload.single("image"),
  async (req, res) => {
    try {
      const data = await rumahService.create(
        req.body,
        req.file
      );

      res.status(201).json({
        success: true,
        message: "Rumah berhasil ditambahkan",
        data,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },
];

// UPDATE
exports.updateRumah = [
  upload.single("image"),
  async (req, res) => {
    try {
      const data = await rumahService.update(
        req.params.id,
        req.body,
        req.file
      );

      res.json({
        success: true,
        message: "Rumah berhasil diperbarui",
        data,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },
];

// DELETE
exports.deleteRumah = async (req, res) => {
  try {
    await rumahService.remove(req.params.id);

    res.json({
      success: true,
      message: "Rumah berhasil dihapus",
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};