const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// helper safe admin
function toSafeAdmin(adminInstance) {
    if (!adminInstance) return null;
    const admin = adminInstance.toJSON ? adminInstance.toJSON() : adminInstance;

    return {
        id_admin: admin.id_admin,
        nama_admin: admin.nama_admin,
        email: admin.email,
    };
}

// REGISTER
exports.register = async ({ nama_admin, email, password }) => {
    if (!nama_admin || !email || !password) {
        throw new Error("Semua field harus diisi");
    }

    const exist = await Admin.findOne({ where: { email } });
    if (exist) {
        throw new Error("Email sudah digunakan");
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

    return {
        admin: toSafeAdmin(admin),
        token,
    };
};

// LOGIN
exports.login = async ({ email, password }) => {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
        throw new Error("Email tidak ditemukan");
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
        throw new Error("Password salah");
    }

    const token = jwt.sign(
        { id: admin.id_admin, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        admin: toSafeAdmin(admin),
        token,
    };
};

// GET ALL
exports.getAll = async () => {
    return await Admin.findAll({
        attributes: ["id_admin", "nama_admin", "email"],
        order: [["id_admin", "DESC"]],
    });
};

// UPDATE
exports.update = async (id, data) => {
    await Admin.update(data, {
        where: { id_admin: id },
    });
};

// DELETE
exports.remove = async (id) => {
    await Admin.destroy({
        where: { id_admin: id },
    });
};