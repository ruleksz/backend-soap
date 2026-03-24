const adminService = require("../services/adminService");

// REGISTER
exports.registerAdmin = async (req, res) => {
  try {
    const result = await adminService.register(req.body);

    res.status(201).json({
      message: "Registrasi admin berhasil",
      ...result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// LOGIN
exports.loginAdmin = async (req, res) => {
  try {
    const result = await adminService.login(req.body);

    res.json({
      message: "Login berhasil",
      ...result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL
exports.getAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAll();
    res.json({ data: admins });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateAdmin = async (req, res) => {
  try {
    await adminService.update(req.params.id, req.body);

    res.json({ message: "Admin berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteAdmin = async (req, res) => {
  try {
    await adminService.remove(req.params.id);

    res.json({ message: "Admin berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};