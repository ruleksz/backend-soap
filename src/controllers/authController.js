// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const { Member } = require("../models"); // dari models/index.js (yang export { Admin, Member, Cabuy, ... })

// Format respon biar seragam
function buildLoginResponse({ id, nama, email, role, token }) {
  return {
    message: "Login berhasil",
    token,
    id,
    nama,
    role,
    email,
  };
}

// POST /auth/login
exports.unifiedLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    // 1. Cek dulu ke tabel ADMIN
    const admin = await Admin.findOne({ where: { email } });

    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (!match) {
        return res.status(400).json({ message: "Password salah" });
      }

      const token = jwt.sign(
        { id: admin.id_admin, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json(
        buildLoginResponse({
          id: admin.id_admin,
          nama: admin.nama_admin,
          email: admin.email,
          role: "admin",
          token,
        })
      );
    }

    // 2. Kalau bukan admin, cek ke tabel MEMBERS
    const member = await Member.findOne({ where: { email } });

    if (!member) {
      return res.status(404).json({
        message: "Email tidak terdaftar sebagai admin atau member",
      });
    }

    const valid = await bcrypt.compare(password, member.password);
    if (!valid) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: member.id_member, role: member.jabatan },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json(
      buildLoginResponse({
        id: member.id_member,
        nama: member.nama,
        email: member.email,
        role: member.jabatan, // 'senior_leader' | 'leader' | 'member'
        token,
      })
    );
  } catch (err) {
    console.error("UNIFIED LOGIN ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
