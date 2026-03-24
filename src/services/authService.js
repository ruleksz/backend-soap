const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const { Member } = require("../models");

// Format respon
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

exports.unifiedLogin = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error("Email dan password wajib diisi");
    }

    // =====================
    // LOGIN ADMIN
    // =====================
    const admin = await Admin.findOne({ where: { email } });

    if (admin) {
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            throw new Error("Password salah");
        }

        const token = jwt.sign(
            { id: admin.id_admin, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return buildLoginResponse({
            id: admin.id_admin,
            nama: admin.nama_admin,
            email: admin.email,
            role: "admin",
            token,
        });
    }

    // =====================
    // LOGIN MEMBER
    // =====================
    const member = await Member.findOne({ where: { email } });

    if (!member) {
        throw new Error("Email tidak terdaftar sebagai admin atau member");
    }

    const valid = await bcrypt.compare(password, member.password);
    if (!valid) {
        throw new Error("Password salah");
    }

    const token = jwt.sign(
        { id: member.id_member, role: member.jabatan },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return buildLoginResponse({
        id: member.id_member,
        nama: member.nama,
        email: member.email,
        role: member.jabatan,
        token,
    });
};