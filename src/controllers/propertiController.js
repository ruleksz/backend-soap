const { Properti, Rumah } = require("../models");

/* =========================================
   HELPER: Detect MIME Type dari Buffer
========================================= */
const detectMimeType = (buffer) => {
  if (!buffer) return null;

  const signature = buffer.toString("hex", 0, 4);

  switch (signature) {
    case "89504e47":
      return "image/png";
    case "ffd8ffe0":
    case "ffd8ffe1":
    case "ffd8ffe2":
    case "ffd8ffe3":
    case "ffd8ffe8":
      return "image/jpeg";
    case "47494638":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

/* =========================================
   CONVERT IMAGE BUFFER TO BASE64 DATA URL
========================================= */
const convertImage = (json) => {
  if (json.image && Buffer.isBuffer(json.image)) {
    const mime = detectMimeType(json.image);
    json.image = `data:${mime};base64,${json.image.toString("base64")}`;
  }
  return json;
};

/* =============================
   GET ALL PROPERTI
============================= */
const getAllProperti = async (req, res) => {
  try {
    const data = await Properti.findAll({
      include: [
        {
          model: Rumah,
          as: "rumahs",
        },
      ],
      order: [["id_properti", "DESC"]],
    });

    const result = data.map((item) => {
      const json = item.toJSON();
      return convertImage(json);
    });

    return res.status(200).json({
      success: true,
      message: "Data properti berhasil diambil",
      data: result,
    });
  } catch (err) {
    console.error("🔥 getAllProperti Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data properti",
      error: err.message,
    });
  }
};

/* =============================
   GET PROPERTI BY ID
============================= */
const getPropertiById = async (req, res) => {
  try {
    const data = await Properti.findByPk(req.params.id, {
      include: [
        {
          model: Rumah,
          as: "rumahs",
        },
      ],
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Properti tidak ditemukan",
      });
    }

    const json = convertImage(data.toJSON());

    return res.status(200).json({
      success: true,
      data: json,
    });
  } catch (err) {
    console.error("🔥 getPropertiById Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil properti",
      error: err.message,
    });
  }
};

/* =============================
   CREATE PROPERTI
============================= */
const createProperti = async (req, res) => {
  try {
    const {
      nama_properti,
      deskripsi,
      lokasi,
      kontraktor,
      kontak_kontraktor,
      id_member,
    } = req.body;

    let image = null;

    if (req.file) {
      image = req.file.buffer;
    }

    const newProperti = await Properti.create({
      nama_properti,
      deskripsi,
      lokasi,
      kontraktor,
      kontak_kontraktor,
      id_member: id_member || null,
      image,
    });

    const json = convertImage(newProperti.toJSON());

    return res.status(201).json({
      success: true,
      message: "Properti berhasil ditambahkan",
      data: json,
    });
  } catch (err) {
    console.error("🔥 createProperti Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat properti",
      error: err.message,
    });
  }
};

/* =============================
   UPDATE PROPERTI
============================= */
const updateProperti = async (req, res) => {
  try {
    const properti = await Properti.findByPk(req.params.id);

    if (!properti) {
      return res.status(404).json({
        success: false,
        message: "Properti tidak ditemukan",
      });
    }

    const {
      nama_properti,
      deskripsi,
      lokasi,
      kontraktor,
      kontak_kontraktor,
      id_member,
    } = req.body;

    const payload = {
      nama_properti,
      deskripsi,
      lokasi,
      kontraktor,
      kontak_kontraktor,
      id_member: id_member || null,
    };

    if (req.file) {
      payload.image = req.file.buffer;
    }

    await properti.update(payload);

    const json = convertImage(properti.toJSON());

    return res.status(200).json({
      success: true,
      message: "Properti berhasil diperbarui",
      data: json,
    });
  } catch (err) {
    console.error("🔥 updateProperti Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui properti",
      error: err.message,
    });
  }
};

/* =============================
   DELETE PROPERTI
============================= */
const deleteProperti = async (req, res) => {
  try {
    const properti = await Properti.findByPk(req.params.id);

    if (!properti) {
      return res.status(404).json({
        success: false,
        message: "Properti tidak ditemukan",
      });
    }

    await properti.destroy();

    return res.status(200).json({
      success: true,
      message: "Properti berhasil dihapus",
    });
  } catch (err) {
    console.error("🔥 deleteProperti Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus properti",
      error: err.message,
    });
  }
};

module.exports = {
  getAllProperti,
  getPropertiById,
  createProperti,
  updateProperti,
  deleteProperti,
};