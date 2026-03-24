const rekomendasiAiService = require("../services/rekomendasiAiService");

// GET ALL
exports.getAllRekomendasi = async (req, res) => {
  try {
    const data = await rekomendasiAiService.getAll();

    res.json({
      success: true,
      message: "Data rekomendasi AI berhasil diambil",
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
exports.getRekomendasiById = async (req, res) => {
  try {
    const data = await rekomendasiAiService.getById(req.params.id);

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
exports.createRekomendasi = async (req, res) => {
  try {
    const data = await rekomendasiAiService.create(req.body);

    res.status(201).json({
      success: true,
      message: "Rekomendasi AI berhasil ditambahkan",
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
exports.updateRekomendasi = async (req, res) => {
  try {
    const data = await rekomendasiAiService.update(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Rekomendasi AI berhasil diperbarui",
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE
exports.deleteRekomendasi = async (req, res) => {
  try {
    await rekomendasiAiService.remove(req.params.id);

    res.json({
      success: true,
      message: "Rekomendasi AI berhasil dihapus",
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};