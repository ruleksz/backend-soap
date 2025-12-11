// controllers/CabuyController.js
const Cabuy = require("../models/Cabuy");
const Member = require("../models/Member");

// Allowed status enum
const ALLOWED_STATUS = ["Baru", "Follow Up", "Siap Survey", "Booking", "Closing", "Lost"];
const MAP_STATUS = { 
  deal: "Closing", 
  closed: "Closing", 
  baru: "Baru", 
  survey: "Siap Survey",
  siap_survey: "Siap Survey"
};

/**
 * GET /api/cabuy
 * Ambil semua cabuy (Difilter berdasarkan User Login)
 */
exports.getCabuy = async (req, res) => {
  try {
    const user = req.user || {}; 
    const { id, role } = user;

    let whereClause = {};

    // Member & Leader: lihat leads miliknya sendiri
    // Admin / senior_leader: lihat semua
    if (role === "member" || role === "leader") {
      whereClause = { id_member: id };
    }

    const cabuy = await Cabuy.findAll({
      where: whereClause,
      // ✅ pakai kolom yang memang ada di tabel cabuy
      order: [["tanggal_masuk", "DESC"]],
    });

    return res.status(200).json({ data: cabuy });
  } catch (err) {
    console.error("Error getCabuy:", err);
    return res
      .status(500)
      .json({ error: "Gagal mengambil data Cabuy", detail: err.message });
  }
};

/**
 * GET /api/cabuy/:id
 * Ambil 1 cabuy by id
 */
exports.getCabuyById = async (req, res) => {
  try {
    const { id } = req.params;
    const cabuy = await Cabuy.findByPk(id);
    if (!cabuy) return res.status(404).json({ error: "Cabuy tidak ditemukan" });
    return res.status(200).json(cabuy);
  } catch (err) {
    console.error("Error getCabuyById:", err);
    return res
      .status(500)
      .json({ error: "Gagal mengambil data Cabuy", detail: err.message });
  }
};

/**
 * POST /api/cabuy
 * Buat cabuy baru (AUTO FILL ID MEMBER kalau body tidak kirim)
 */
exports.createCabuy = async (req, res) => {
  try {
    let { nama_cabuy, kontak, status, tanggal_follow_up, tanggal_masuk, id_member } =
      req.body || {};

    const user = req.user || {};

    // Validasi minimal
    if (!nama_cabuy || !kontak) {
      return res.status(400).json({ error: "Nama dan Kontak wajib diisi" });
    }

    // 🔹 Jika body tidak kirim id_member, ambil dari token
    if (!id_member && user && user.id) {
      id_member = user.id;
    }

    // Normalisasi & validasi id_member jika ada
    if (id_member !== undefined && id_member !== null && id_member !== "") {
      id_member = Number(id_member);
      if (isNaN(id_member)) {
        return res.status(400).json({ error: "id_member tidak valid." });
      }

      const checkMember = await Member.findByPk(id_member);
      if (!checkMember) {
        return res
          .status(400)
          .json({ error: "ID Member tidak valid atau tidak ditemukan." });
      }
    } else {
      // Kalau benar-benar tidak ada id_member, biarkan null (opsional, kalau kamu mau wajib, tinggal return error di sini)
      id_member = null;
    }

    // Normalize Status
    status = status || "Baru";
    if (!ALLOWED_STATUS.includes(status)) {
      const mapped = MAP_STATUS[(status || "").toLowerCase()];
      status = mapped || "Baru";
    }

    // Normalize Tanggal (Set ke NULL jika string kosong)
    const tgl_follow = tanggal_follow_up === "" ? null : tanggal_follow_up;
    const tgl_masuk =
      tanggal_masuk === "" ? null : tanggal_masuk || new Date(); // Default hari ini jika kosong

    const newCabuy = await Cabuy.create({
      nama_cabuy,
      kontak,
      tanggal_follow_up: tgl_follow,
      tanggal_masuk: tgl_masuk,
      status,
      id_member,
    });

    return res
      .status(201)
      .json({ message: "Cabuy berhasil dibuat", data: newCabuy });
  } catch (err) {
    console.error("Error createCabuy:", err);
    return res
      .status(500)
      .json({ error: "Gagal membuat Cabuy", detail: err.message });
  }
};

/**
 * PUT /api/cabuy/:id
 * Update cabuy
 */
exports.updateCabuy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_cabuy,
      kontak,
      status,
      tanggal_follow_up,
      tanggal_masuk,
      id_member,
    } = req.body || {};

    const cabuy = await Cabuy.findByPk(id);
    if (!cabuy) return res.status(404).json({ error: "Cabuy tidak ditemukan" });

    // Normalisasi id_member kalau dikirim (optional dipindah-pindah)
    let normalizedMemberId = cabuy.id_member;
    if (id_member !== undefined) {
      if (!id_member) normalizedMemberId = null;
      else {
        const n = Number(id_member);
        if (!isNaN(n)) normalizedMemberId = n;
      }
    }

    // Validate Status
    let normalizedStatus = cabuy.status;
    if (status !== undefined) {
      if (ALLOWED_STATUS.includes(status)) {
        normalizedStatus = status;
      } else {
        const mapped = MAP_STATUS[(status || "").toLowerCase()];
        if (mapped) normalizedStatus = mapped;
      }
    }

    const updated = await cabuy.update({
      nama_cabuy:
        nama_cabuy !== undefined ? nama_cabuy : cabuy.nama_cabuy,
      kontak: kontak !== undefined ? kontak : cabuy.kontak,
      tanggal_follow_up:
        tanggal_follow_up === ""
          ? null
          : tanggal_follow_up !== undefined
          ? tanggal_follow_up
          : cabuy.tanggal_follow_up,
      tanggal_masuk:
        tanggal_masuk === ""
          ? null
          : tanggal_masuk !== undefined
          ? tanggal_masuk
          : cabuy.tanggal_masuk,
      status: normalizedStatus,
      id_member: normalizedMemberId,
    });

    return res
      .status(200)
      .json({ message: "Cabuy berhasil diupdate", data: updated });
  } catch (err) {
    console.error("Error updateCabuy:", err);
    return res
      .status(500)
      .json({ error: "Gagal memperbarui Cabuy", detail: err.message });
  }
};

/**
 * DELETE /api/cabuy/:id
 */
exports.deleteCabuy = async (req, res) => {
  try {
    const { id } = req.params;
    const cabuy = await Cabuy.findByPk(id);
    if (!cabuy) return res.status(404).json({ error: "Cabuy tidak ditemukan" });

    await cabuy.destroy();
    return res.status(200).json({ message: "Cabuy berhasil dihapus" });
  } catch (err) {
    console.error("Error deleteCabuy:", err);
    return res
      .status(500)
      .json({ error: "Gagal menghapus Cabuy", detail: err.message });
  }
};
