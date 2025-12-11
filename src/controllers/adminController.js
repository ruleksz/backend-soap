// controllers/adminController.js
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: format admin tanpa password
function toSafeAdmin(adminInstance) {
  if (!adminInstance) return null;
  const admin = adminInstance.toJSON ? adminInstance.toJSON() : adminInstance;
  return {
    id_admin: admin.id_admin,
    nama_admin: admin.nama_admin,
    email: admin.email,
  };
}

// REGISTER ADMIN
exports.registerAdmin = async (req, res) => {
  try {
    const { nama_admin, email, password } = req.body;

    if (!nama_admin || !email || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const exist = await Admin.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      nama_admin,
      email,
      password: hashed,
    });

    const token = jwt.sign(
      { id: admin.id_admin, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Registrasi admin berhasil",
      admin: toSafeAdmin(admin),
      token,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN ADMIN (opsional kalau masih mau pakai /admin/login)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: admin.id_admin, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      admin: toSafeAdmin(admin),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL ADMIN
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ["id_admin", "nama_admin", "email"],
      order: [["id_admin", "DESC"]],
    });
    res.json({ data: admins });
  } catch (err) {
    console.error("GET ADMINS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE ADMIN
exports.updateAdmin = async (req, res) => {
  try {
    const { nama_admin, email } = req.body;
    const { id } = req.params;

    await Admin.update(
      { nama_admin, email },
      { where: { id_admin: id } }
    );

    res.json({ message: "Admin berhasil diupdate" });
  } catch (err) {
    console.error("UPDATE ADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE ADMIN
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await Admin.destroy({ where: { id_admin: id } });

    res.json({ message: "Admin berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
