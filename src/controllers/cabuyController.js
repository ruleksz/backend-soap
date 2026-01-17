const { Cabuy, Rumah, Agent } = require("../models");

// ================= ENUM STATUS =================
const ALLOWED_STATUS = ["Baru", "Follow Up", "Siap Survey", "Booking", "Closing", "Lost"];

const MAP_STATUS = {
  deal: "Closing",
  closed: "Closing",
  baru: "Baru",
  survey: "Siap Survey",
  siap_survey: "Siap Survey",
};

// ================= GET ALL =================
exports.getAllCabuy = async (req, res) => {
  try {
    const { id, role } = req.user;
    let whereClause = {};

    if (role === "member") {
      whereClause = { id_member: id };
    }

    const cabuy = await Cabuy.findAll({
      where: whereClause,
      include: [{ model: Rumah, as: "rumah" }],
      order: [["tanggal_masuk", "DESC"]],
    });

    res.json({ data: cabuy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET BY AGENT =================
exports.getCabuyByAgent = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role !== "member") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const cabuy = await Cabuy.findAll({
      where: { id_member: id },
      include: [{ model: Rumah, as: "rumah" }],
    });

    res.json({ data: cabuy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET BY STATUS =================
/* =========================
   GET /api/cabuy/senior
   → Senior Leader lihat cabuy
     berdasarkan status (kecuali "Baru")
========================= */
exports.getCabuyForSenior = async (req, res) => {
  try {
    const { role, id } = req.user;

    // 🔒 hanya senior leader
    if (role !== "senior_leader") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const ALLOWED_STATUS = [
      "Follow Up",
      "Siap Survey",
      "Booking",
      "Closing",
      "Lost",
    ];

    const cabuy = await Cabuy.findAll({
      where: {
        status: ALLOWED_STATUS, // otomatis jadi IN (...)
      },
      include: [
        {
          model: Rumah,
          as: "rumah",
          attributes: ["id_rumah", "tipe", "harga"],
        },
      ],
      order: [["tanggal_masuk", "DESC"]],
    });

    res.status(200).json({
      message: "Berhasil mengambil data cabuy senior leader",
      data: cabuy,
    });
  } catch (err) {
    console.error("Error getCabuyForSenior:", err);
    res.status(500).json({
      message: "Gagal mengambil data cabuy",
      error: err.message,
    });
  }
};

// ================= GET BY ID =================
exports.getCabuyById = async (req, res) => {
  try {
    const cabuy = await Cabuy.findByPk(req.params.id, {
      include: [{ model: Rumah, as: "rumah" }],
    });

    if (!cabuy) return res.status(404).json({ message: "Cabuy tidak ditemukan" });
    res.json({ data: cabuy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE =================
exports.createCabuy = async (req, res) => {
  try {
    const { nama_cabuy, kontak, status = "Baru", tanggal_follow_up, id_rumah } = req.body;

    if (!nama_cabuy || !kontak || !id_rumah) {
      return res.status(400).json({ message: "Field wajib belum lengkap" });
    }

    // 🔥 cari agent
    const agent = await Agent.findOne({ where: { id_rumah } });
    if (!agent) {
      return res.status(400).json({
        message: "Rumah ini belum memiliki agent",
      });
    }

    const cabuy = await Cabuy.create({
      nama_cabuy,
      kontak,
      status,
      tanggal_follow_up: tanggal_follow_up || null,
      id_rumah,
      id_member: agent.id_member,
    });

    res.status(201).json({ message: "Cabuy berhasil dibuat", data: cabuy });
  } catch (err) {
    console.error("CREATE CABUY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE =================
exports.updateCabuy = async (req, res) => {
  try {
    const cabuy = await Cabuy.findByPk(req.params.id);
    if (!cabuy) return res.status(404).json({ message: "Cabuy tidak ditemukan" });

    const { nama_cabuy, kontak, status, tanggal_follow_up } = req.body;

    let normalizedStatus = cabuy.status;
    if (status) {
      if (ALLOWED_STATUS.includes(status)) normalizedStatus = status;
      else if (MAP_STATUS[status.toLowerCase()])
        normalizedStatus = MAP_STATUS[status.toLowerCase()];
    }

    await cabuy.update({
      nama_cabuy: nama_cabuy ?? cabuy.nama_cabuy,
      kontak: kontak ?? cabuy.kontak,
      tanggal_follow_up:
        tanggal_follow_up === "" ? null : tanggal_follow_up ?? cabuy.tanggal_follow_up,
      status: normalizedStatus,
    });

    res.json({ message: "Cabuy berhasil diupdate", data: cabuy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
exports.deleteCabuy = async (req, res) => {
  try {
    const cabuy = await Cabuy.findByPk(req.params.id);
    if (!cabuy) return res.status(404).json({ message: "Cabuy tidak ditemukan" });

    await cabuy.destroy();
    res.json({ message: "Cabuy berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
