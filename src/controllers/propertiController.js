// controllers/propertiController.js
const { Properti, Member, Rumah } = require("../models");

// =============================
//  GET ALL PROPERTI
// =============================
exports.getAllProperti = async (req, res) => {
  try {
    const data = await Properti.findAll({
      include: [
        {
          model: Member,
          as: "owner_senior",
          attributes: ["id_member", "nama", "email"], // kontak DIHAPUS
        },
        {
          model: Rumah,
          as: "rumahs",
        }
      ],
      order: [["id_properti", "DESC"]],
    });

    const result = data.map((item) => {
      const json = item.toJSON();
      if (json.image && Buffer.isBuffer(json.image)) {
        json.image = `data:image/jpeg;base64,${json.image.toString("base64")}`;
      }
      return json;
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


// =============================
//  GET PROPERTI BY ID
// =============================
exports.getPropertiById = async (req, res) => {
  try {
    const data = await Properti.findByPk(req.params.id, {
      include: [
        {
          model: Member,
          as: "owner_senior",
          attributes: ["id_member", "nama", "email"], // kontak DIHAPUS
        },
        {
          model: Rumah,
          as: "rumahs",
        }
      ],
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Properti tidak ditemukan",
      });
    }

    const json = data.toJSON();
    if (json.image && Buffer.isBuffer(json.image)) {
      json.image = `data:image/jpeg;base64,${json.image.toString("base64")}`;
    }

    return res.status(200).json({ success: true, data: json });

  } catch (err) {
    console.error("🔥 getPropertiById Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil properti",
      error: err.message,
    });
  }
};


// =============================
//  CREATE PROPERTI
// =============================
exports.createProperti = async (req, res) => {
  try {
    let { nama_properti, deskripsi, lokasi, kontraktor, kontak_kontraktor, id_member } = req.body;

    if (!id_member && req.user) {
      id_member = req.user.id;
    }

    if (!id_member) {
      return res.status(400).json({ success: false, message: "id_member diperlukan" });
    }

    const owner = await Member.findByPk(id_member);
    if (!owner) {
      return res.status(404).json({ success: false, message: "Member tidak ditemukan" });
    }

    if (owner.jabatan !== "senior_leader") {
      return res.status(403).json({ success: false, message: "Hanya Senior Leader yang dapat menjadi owner properti" });
    }

    const newProperti = await Properti.create({
      nama_properti,
      deskripsi,
      lokasi,
      kontraktor,
      kontak_kontraktor,
      id_member,
    });

    return res.status(201).json({
      success: true,
      message: "Properti berhasil ditambahkan",
      data: newProperti,
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


// =============================
//  UPDATE PROPERTI
// =============================
exports.updateProperti = async (req, res) => {
  try {
    const properti = await Properti.findByPk(req.params.id);
    if (!properti) {
      return res.status(404).json({ success: false, message: "Properti tidak ditemukan" });
    }

    await properti.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Properti berhasil diperbarui",
      data: properti,
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


// =============================
//  DELETE PROPERTI
// =============================
exports.deleteProperti = async (req, res) => {
  try {
    const properti = await Properti.findByPk(req.params.id);
    if (!properti) {
      return res.status(404).json({ success: false, message: "Properti tidak ditemukan" });
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
