// controllers/rumahController.js
const Rumah = require("../models/Rumah");
const Properti = require("../models/Properti");
const Member = require("../models/Member");
const multer = require("multer");

// simpan file gambar ke memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 📄 GET semua Rumah
exports.getAllRumah = async (req, res) => {
  try {
    const data = await Rumah.findAll({
      include: [
        { model: Properti, as: "properti", attributes: ["id_properti", "nama_properti", "id_member"] },
      ],
      order: [["id_rumah", "DESC"]],
    });

    const result = data.map((item) => {
      const json = item.toJSON();
      if (json.image) json.image = `data:image/jpeg;base64,${json.image.toString("base64")}`;
      return json;
    });

    res.status(200).json({ success: true, message: "Data rumah berhasil diambil", data: result });
  } catch (err) {
    console.error("getAllRumah Error:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil data rumah" });
  }
};

// 📄 GET rumah berdasarkan ID
exports.getRumahById = async (req, res) => {
  try {
    const { id } = req.params;
    const rumah = await Rumah.findByPk(id, {
      include: [{ model: Properti, as: "properti", attributes: ["id_properti", "nama_properti", "id_member"] }],
    });

    if (!rumah) return res.status(404).json({ success: false, message: "Rumah tidak ditemukan" });

    const data = rumah.toJSON();
    if (data.image) data.image = `data:image/jpeg;base64,${data.image.toString("base64")}`;

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getRumahById Error:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil data rumah" });
  }
};

// ➕ TAMBAH rumah baru
exports.createRumah = [
  upload.single("image"),
  async (req, res) => {
    try {
      let { tipe, lb, lt, jml_kamar, jml_lantai, harga, id_properti, id_member } = req.body;

      // fallback id_member dari token (opsional)
      if (!id_member && req.user && req.user.id) id_member = req.user.id;

      if (!id_properti) {
        return res.status(400).json({ success: false, message: "id_properti diperlukan" });
      }

      const properti = await Properti.findByPk(id_properti);
      if (!properti) {
        return res.status(404).json({ success: false, message: "Properti tidak ditemukan" });
      }

      // permission: admin boleh; non-admin hanya boleh tambah rumah jika dia owner properti
      const requesterRole = req.user?.role;
      const requesterId = req.user?.id;
      if (requesterRole !== "admin") {
        if (Number(properti.id_member) !== Number(requesterId)) {
          return res.status(403).json({ success: false, message: "Anda tidak punya izin menambah rumah pada properti ini" });
        }
      }

      // validasi member jika diberikan
      if (id_member) {
        const member = await Member.findByPk(id_member);
        if (!member) return res.status(404).json({ success: false, message: "Member tidak ditemukan" });
      }

      const rumah = await Rumah.create({
        tipe,
        lb,
        lt,
        jml_kamar,
        jml_lantai,
        harga,
        id_properti: Number(id_properti),
        id_member: id_member ? Number(id_member) : null,
        image: req.file ? req.file.buffer : null,
      });

      res.status(201).json({ success: true, message: "Rumah berhasil ditambahkan", data: rumah });
    } catch (err) {
      console.error("createRumah Error:", err);
      res.status(500).json({ success: false, message: "Gagal menambahkan rumah" });
    }
  },
];

// ✏️ UPDATE rumah berdasarkan ID
exports.updateRumah = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { tipe, lb, lt, jml_kamar, jml_lantai, harga, id_properti } = req.body;

      const rumah = await Rumah.findByPk(id);
      if (!rumah) return res.status(404).json({ success: false, message: "Rumah tidak ditemukan" });

      // jika id_properti diubah, pastikan properti baru ada
      if (id_properti) {
        const propertiBaru = await Properti.findByPk(id_properti);
        if (!propertiBaru) return res.status(404).json({ success: false, message: "Properti tujuan tidak ditemukan" });
      }

      // permission: admin boleh; atau owner properti lama boleh (dan/atau owner properti baru jika pindah) 
      const requesterRole = req.user?.role;
      const requesterId = req.user?.id;
      if (requesterRole !== "admin") {
        // ambil properti terkait rumah saat ini
        const propertiSaatIni = await Properti.findByPk(rumah.id_properti);
        if (!propertiSaatIni || Number(propertiSaatIni.id_member) !== Number(requesterId)) {
          return res.status(403).json({ success: false, message: "Anda tidak punya izin memperbarui rumah ini" });
        }
      }

      await rumah.update({
        tipe,
        lb,
        lt,
        jml_kamar,
        jml_lantai,
        harga,
        id_properti: id_properti ? Number(id_properti) : rumah.id_properti,
        image: req.file ? req.file.buffer : rumah.image,
      });

      res.status(200).json({ success: true, message: "Rumah berhasil diperbarui", data: rumah });
    } catch (err) {
      console.error("updateRumah Error:", err);
      res.status(500).json({ success: false, message: "Gagal memperbarui rumah" });
    }
  },
];

// 🗑️ HAPUS rumah berdasarkan ID
exports.deleteRumah = async (req, res) => {
  try {
    const { id } = req.params;
    const rumah = await Rumah.findByPk(id);
    if (!rumah) return res.status(404).json({ success: false, message: "Rumah tidak ditemukan" });

    const requesterRole = req.user?.role;
    const requesterId = req.user?.id;
    if (requesterRole !== "admin") {
      const properti = await Properti.findByPk(rumah.id_properti);
      if (!properti || Number(properti.id_member) !== Number(requesterId)) {
        return res.status(403).json({ success: false, message: "Anda tidak punya izin menghapus rumah ini" });
      }
    }

    await rumah.destroy();
    res.status(200).json({ success: true, message: "Rumah berhasil dihapus" });
  } catch (err) {
    console.error("deleteRumah Error:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus rumah" });
  }
};
