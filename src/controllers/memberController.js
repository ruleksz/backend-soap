// src/controllers/memberController.js
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
      nama: member.nama,        // di DB kolomnya 'nama'
      role: member.jabatan,
      email: member.email,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Terjadi kesalahan login" });
  }
};

// ------------------------------------------------------------------
// 2. GET MEMBERS (DASHBOARD LOGIC)
// ------------------------------------------------------------------
exports.getMembers = async (req, res) => {
  try {
    const { id, role } = req.user;
    let finalResult = [];

    // --- A. SENIOR LEADER (lihat LEADER & jumlah member bawahan mereka) ---
    if (role === "senior_leader") {
      const leaders = await Member.findAll({
        where: {
          id_senior: id,
          jabatan: "leader",         // 🔒 pastikan hanya leader
        },
        include: [
          {
            model: Member,
            as: "members_bawahan",
            attributes: ["id_member"],
          },
        ],
        order: [["id_member", "DESC"]],
      });

      finalResult = leaders.map((l) => {
        const item = l.toJSON();
        item.total_members = item.members_bawahan
          ? item.members_bawahan.length
          : 0;
        delete item.members_bawahan;
        return item;
      });

      // --- B. LEADER (lihat MEMBER & jumlah leads mereka) ---
    } else if (role === "leader") {
      const members = await Member.findAll({
        where: {
          id_leader: id,
          jabatan: "member",        // 🔒 pastikan hanya member
        },
        include: [
          {
            model: Cabuy,
            as: "leads",
            attributes: ["id_cabuy"],
          },
        ],
        order: [["id_member", "DESC"]],
      });

      finalResult = members.map((m) => {
        const item = m.toJSON();
        item.total_leads = item.leads ? item.leads.length : 0;
        delete item.leads;
        return item;
      });

      // --- C. ADMIN (lihat SENIOR LEADER) ---
    } else if (role === "admin") {
      finalResult = await Member.findAll({
        where: { jabatan: "senior_leader" },
        order: [["id_member", "DESC"]],
      });
    } else {
      // Role lain tidak boleh akses daftar ini
      return res.status(403).json({ message: "Role tidak diizinkan" });
    }

    res.json({ members: finalResult });
  } catch (err) {
    console.error("Error Get Members:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------------------------------------------------
// 3. CREATE MEMBER (HIERARKI OTOMATIS)
// ------------------------------------------------------------------
exports.createMember = async (req, res) => {
  try {
    const { nama, email, password, kontak, jabatan } = req.body;
    const creator = req.user; // Dari Token

    if (!creator || !creator.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // --- Validasi Role Creator ---
    if (creator.role === "admin" && jabatan !== "senior_leader")
      return res
        .status(403)
        .json({ message: "Admin hanya bisa buat Senior Leader" });
    if (creator.role === "senior_leader" && jabatan !== "leader")
      return res
        .status(403)
        .json({ message: "Senior hanya bisa buat Leader" });
    if (creator.role === "leader" && jabatan !== "member")
      return res
        .status(403)
        .json({ message: "Leader hanya bisa buat Member" });

    const hashed = await bcrypt.hash(password, 10);

    // ⚠️ pakai kolom 'nama' sesuai DB
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

    // --- Logic Pengisian ID Parent ---
    if (creator.role === "admin") {
      data.id_admin = creator.id;
    } else if (creator.role === "senior_leader") {
      data.id_senior = creator.id;
    } else if (creator.role === "leader") {
      data.id_leader = creator.id;

      const leaderData = await Member.findByPk(creator.id);
      if (leaderData && leaderData.id_senior) {
        data.id_senior = leaderData.id_senior;
      }
    }

    const newMember = await Member.create(data);
    res.status(201).json({ message: "Berhasil dibuat", data: newMember });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------------------------------------------------
// 4. UPDATE MEMBER
// ------------------------------------------------------------------
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password, kontak } = req.body;

    const member = await Member.findByPk(id);
    if (!member) return res.status(404).json({ message: "Member tidak ditemukan" });

    // Sesuaikan dengan field di tabel
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
// ------------------------------------------------------------------
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findByPk(id);
    if (!member) return res.status(404).json({ message: "Member tidak ditemukan" });

    await member.destroy();
    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
