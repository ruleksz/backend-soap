const { Member, Cabuy } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ------------------------------------------------------------------
// 1. LOGIN
// ------------------------------------------------------------------
exports.loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;
    const member = await Member.findOne({ where: { email } });

    if (!member) return res.status(404).json({ message: "Email tidak terdaftar" });

    const isValid = await bcrypt.compare(password, member.password);
    if (!isValid) return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: member.id_member, role: member.jabatan },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      id: member.id_member,
      nama: member.nama,
      role: member.jabatan,
      email: member.email,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Terjadi kesalahan login" });
  }
};

// ------------------------------------------------------------------
// 2. GET MEMBERS (KHUSUS MEMBER ROLE = "member")
//    → tampil di ADMIN, SENIOR LEADER, LEADER
// ------------------------------------------------------------------
/* =====================================================
   1. GET MEMBER (READ)
   → admin, senior_leader, leader
===================================================== */
exports.getMembers = async (req, res) => {
  try {
    const { id, role } = req.user;
    let result = [];

    // ---------------- ADMIN ----------------
    if (role === "admin") {
      result = await Member.findAll({
        where: { jabatan: "member" },
        order: [["id_member", "DESC"]],
      });
    }

    // ---------------- SENIOR LEADER ----------------
    else if (role === "senior_leader") {
      // ambil semua leader di bawah senior
      const leaders = await Member.findAll({
        where: { id_senior: id, jabatan: "leader" },
        attributes: ["id_member"],
      });

      const leaderIds = leaders.map(l => l.id_member);

      result = await Member.findAll({
        where: {
          jabatan: "member",
          id_leader: leaderIds,
        },
        order: [["id_member", "DESC"]],
      });
    }

    // ---------------- LEADER ----------------
    else if (role === "leader") {
      result = await Member.findAll({
        where: {
          jabatan: "member",
          id_leader: id,
        },
        order: [["id_member", "DESC"]],
      });
    }

    else {
      return res.status(403).json({ message: "Role tidak diizinkan" });
    }

    res.json({ members: result });
  } catch (err) {
    console.error("Error getMembers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------------------------------------------------
// 3. CREATE MEMBER
//    → HANYA ADMIN & LEADER
// ------------------------------------------------------------------
exports.createMember = async (req, res) => {
  try {
    const { nama, email, password, kontak, jabatan } = req.body;
    const creator = req.user; // dari JWT

    // =================================================
    // VALIDASI ROLE
    // =================================================
    if (!["admin", "senior_leader", "leader"].includes(creator.role)) {
      return res.status(403).json({ message: "Tidak punya akses" });
    }

    // =================================================
    // VALIDASI JABATAN YANG BOLEH DIBUAT
    // =================================================
    if (creator.role === "leader" && jabatan !== "member") {
      return res.status(403).json({
        message: "Leader hanya boleh menambah MEMBER",
      });
    }

    if (creator.role === "senior_leader" && jabatan !== "leader") {
      return res.status(403).json({
        message: "Senior Leader hanya boleh menambah LEADER",
      });
    }

    const adminAllowed = ["senior_leader", "leader", "member"];
    if (creator.role === "admin" && !adminAllowed.includes(jabatan)) {
      return res.status(400).json({ message: "Jabatan tidak valid" });
    }

    // =================================================
    // HASH PASSWORD
    // =================================================
    const hashed = await bcrypt.hash(password, 10);

    const data = {
      nama,
      email,
      kontak: kontak || "",
      password: hashed,
      jabatan,
      id_admin: null,
      id_senior: null,
      id_leader: null,
    };

    // =================================================
    // LOGIC RELASI OTOMATIS
    // =================================================

    // ---------- ADMIN ----------
    if (creator.role === "admin") {
      data.id_admin = creator.id;

      // admin buat leader → bisa set senior
      if (jabatan === "leader" && req.body.id_senior) {
        data.id_senior = req.body.id_senior;
      }

      // admin buat member → set leader
      if (jabatan === "member" && req.body.id_leader) {
        data.id_leader = req.body.id_leader;

        const leaderData = await Member.findByPk(req.body.id_leader);
        if (leaderData?.id_senior) {
          data.id_senior = leaderData.id_senior;
        }
      }
    }

    // ---------- SENIOR LEADER ----------
    if (creator.role === "senior_leader") {
      // 🔥 otomatis leader ini di bawah senior ini
      data.jabatan = "leader";
      data.id_senior = creator.id;
    }

    // ---------- LEADER ----------
    if (creator.role === "leader") {
      data.jabatan = "member";
      data.id_leader = creator.id;

      const leaderData = await Member.findByPk(creator.id);
      if (leaderData?.id_senior) {
        data.id_senior = leaderData.id_senior;
      }
    }

    // =================================================
    // CREATE
    // =================================================
    const newMember = await Member.create(data);

    res.status(201).json({
      message: "User berhasil dibuat",
      data: newMember,
    });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};



// ------------------------------------------------------------------
// 4. UPDATE MEMBER
//    → HANYA ADMIN & LEADER
// ------------------------------------------------------------------
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password, kontak } = req.body;
    const { role } = req.user;

    if (!["admin", "leader"].includes(role)) {
      return res.status(403).json({
        message: "Hanya admin dan leader yang boleh mengubah data member",
      });
    }

    const member = await Member.findByPk(id);
    if (!member) return res.status(404).json({ message: "Member tidak ditemukan" });

    if (nama) member.nama = nama;
    if (email) member.email = email;
    if (kontak) member.kontak = kontak;
    if (password) member.password = await bcrypt.hash(password, 10);

    await member.save();
    res.json({ message: "Update berhasil", data: member });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------------------------------------------------
// 5. DELETE MEMBER
//    → HANYA ADMIN & LEADER
// ------------------------------------------------------------------
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (!["admin", "leader"].includes(role)) {
      return res.status(403).json({
        message: "Hanya admin dan leader yang boleh menghapus member",
      });
    }

    const member = await Member.findByPk(id);
    if (!member) return res.status(404).json({ message: "Member tidak ditemukan" });

    await member.destroy();
    res.json({ message: "Member berhasil dihapus" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getLeadersBySenior = async (req, res) => {
  try {
    const { id, role } = req.user;

    // 🔒 hanya admin & senior leader yang boleh akses
    if (!["admin", "senior_leader"].includes(role)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // =================================================
    // FILTER KONDISI
    // =================================================
    let whereClause = { jabatan: "leader" };

    // Kalau SENIOR → hanya leader yg dia buat
    if (role === "senior_leader") {
      whereClause.id_senior = id;
    }

    // Kalau ADMIN → lihat semua leader (tanpa filter id_senior)

    const leaders = await Member.findAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: "members_bawahan",
          attributes: ["id_member"], // cukup id saja
        },
      ],
      order: [["id_member", "DESC"]],
    });

    const result = leaders.map((l) => {
      const data = l.toJSON();
      return {
        ...data,
        total_members: data.members_bawahan
          ? data.members_bawahan.length
          : 0,
      };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error getLeadersBySenior:", err);
    return res.status(500).json({
      message: "Gagal mengambil data leader",
      error: err.message,
    });
  }
};

// GET /api/members/leaders-members-cabuys
exports.getLeadersMembersCabuys = async (req, res) => {
  try {
    const { role, id } = req.user;

    // 🔒 hanya admin
    if (role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const leaders = await Member.findAll({
      where: { jabatan: "leader" },
      attributes: ["id_member", "nama", "email"],
      include: [
        {
          model: Member,
          as: "members_bawahan",
          where: { jabatan: "member" },
          required: false,
          attributes: ["id_member", "nama", "email", "kontak"],
          include: [
            {
              model: Cabuy,
              as: "cabuys", // pastikan relasi ini ada di model
              attributes: [
                "id_cabuy",
                "nama_cabuy",
                "kontak",
                "status",
                "tanggal_masuk",
              ],
            },
          ],
        },
      ],
      order: [["id_member", "DESC"]],
    });

    return res.json({
      success: true,
      data: leaders,
    });
  } catch (err) {
    console.error("Error getLeadersMembersCabuys:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ------------------------------------------------------------------
// GET SENIOR LEADER
// ------------------------------------------------------------------
exports.getSeniorLeaders = async (req, res) => {
  try {
    const { role } = req.user;

    // 🔒 hanya admin (opsional: tambah senior_leader kalau mau)
    if (role !== "admin") {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    const seniors = await Member.findAll({
      where: { jabatan: "senior_leader" },
      order: [["id_member", "DESC"]],
    });

    return res.json({
      success: true,
      members: seniors,
    });
  } catch (err) {
    console.error("Error getSeniorLeaders:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data senior leader",
      error: err.message,
    });
  }
};