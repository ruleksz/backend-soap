// 🔥 PENTING: Import dari '../models' (bukan '../models/Member') agar relasi di index.js terbaca!
const { Member, Cabuy } = require("../models"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize"); // 🔥 BARU: Diperlukan untuk fungsi COUNT

// 🔹 LOGIN MEMBER
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
            data: {
                id_member: member.id_member,
                nama: member.nama,
                email: member.email,
                jabatan: member.jabatan,
                id_leader: member.id_leader, 
                id_senior: member.id_senior
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan login" });
    }
};

// 🔹 GET MEMBERS (Full Logic Hitung-Hitungan)
exports.getMembers = async (req, res) => {
    try {
        const { id, role } = req.user;
        let members = [];

        // 1. ADMIN (Lihat Semua)
        if (role === "admin") {
            members = await Member.findAll({ order: [["id_member", "DESC"]] });
        
        // 🔥 BARU: LOGIKA SENIOR LEADER
        } else if (role === "senior_leader") {
            members = await Member.findAll({
                where: { 
                    id_senior: id,     
                    jabatan: "leader" 
                },
                attributes: {
                    include: [
                        // 🔥 BARU: Menghitung jumlah 'members' (anak buah leader)
                        [
                            Sequelize.fn("COUNT", Sequelize.col("members.id_member")), 
                            "total_members" 
                        ]
                    ]
                },
                include: [{
                    model: Member,
                    as: "members",      // 🔥 BARU: Harus sama dengan alias di index.js kamu
                    attributes: [],     // Kita tidak butuh datanya, cuma butuh hitungannya
                }],
                group: ["Member.id_member"], // 🔥 BARU: Wajib group by ID agar count akurat per orang
                order: [["id_member", "DESC"]]
            });

        // 🔥 BARU: LOGIKA LEADER
        } else if (role === "leader") {
            members = await Member.findAll({
                where: { id_leader: id },
                attributes: {
                    include: [
                        // 🔥 BARU: Hitung Total Leads (Cabuy)
                        [
                            Sequelize.fn("COUNT", Sequelize.col("leads.id_cabuy")), 
                            "total_leads"
                        ]
                    ]
                },
                include: [{
                    model: Cabuy,
                    as: "leads",        // 🔥 BARU: Pastikan relasi Cabuy ada di index.js
                    attributes: [], 
                }],
                group: ["Member.id_member"],
                order: [["id_member", "DESC"]]
            });
        
        // 4. MEMBER (Lihat Diri Sendiri)
        } else if (role === "member") {
            members = await Member.findAll({ where: { id_member: id } });
        }

        res.json({ members });

    } catch (err) {
        console.error("Error Get Members:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 🔹 CREATE MEMBER
exports.createMember = async (req, res) => {
    try {
        const { nama, email, password, jabatan } = req.body;
        const creator = req.user;

        // Validasi Role Creator
        if (creator.role === "admin" && jabatan !== "senior_leader")
            return res.status(403).json({ message: "Admin hanya buat Senior Leader" });
        if (creator.role === "senior_leader" && jabatan !== "leader")
            return res.status(403).json({ message: "Senior hanya buat Leader" });
        if (creator.role === "leader" && jabatan !== "member")
            return res.status(403).json({ message: "Leader hanya buat Member" });
        if (creator.role === "member")
            return res.status(403).json({ message: "Member tidak ada akses" });

        const hashed = await bcrypt.hash(password, 10);

        const data = {
            nama, email, password: hashed, jabatan,
            id_admin: null, id_senior: null, id_leader: null
        };

        // 🔥 BARU: Logika Assign Parent ID (Hierarki)
        if (creator.role === "admin") data.id_admin = creator.id;
        else if (creator.role === "senior_leader") data.id_senior = creator.id;
        else if (creator.role === "leader") {
            data.id_leader = creator.id;
            // Cari Senior Leader di atasnya agar data lengkap
            const leaderData = await Member.findByPk(creator.id);
            if (leaderData && leaderData.id_senior) data.id_senior = leaderData.id_senior; 
        }

        const newMember = await Member.create(data);
        res.status(201).json({ message: "Berhasil dibuat", data: newMember });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 🔹 UPDATE MEMBER
exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, password, jabatan } = req.body;
        const updater = req.user;

        const member = await Member.findByPk(id);
        if (!member) return res.status(404).json({ message: "Member tidak ditemukan" });

        let canUpdate = false;
        if (updater.role === "admin" && member.jabatan === "senior_leader") canUpdate = true;
        if (updater.role === "senior_leader" && member.id_senior === updater.id) canUpdate = true;
        if (updater.role === "leader" && member.id_leader === updater.id) canUpdate = true;

        if (!canUpdate) return res.status(403).json({ message: "Akses ditolak" });

        if (nama) member.nama = nama;
        if (email) member.email = email;
        if (jabatan) member.jabatan = jabatan;
        if (password) member.password = await bcrypt.hash(password, 10);

        await member.save();
        res.json({ message: "Update berhasil", data: member });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 🔹 DELETE MEMBER
exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const deleter = req.user;

        const member = await Member.findByPk(id);
        if (!member) return res.status(404).json({ message: "Member tidak ditemukan" });

        let canDelete = false;
        if (deleter.role === "admin" && member.jabatan === "senior_leader") canDelete = true;
        if (deleter.role === "senior_leader" && member.id_senior === deleter.id) canDelete = true;
        if (deleter.role === "leader" && member.id_leader === deleter.id) canDelete = true;

        if (!canDelete) return res.status(403).json({ message: "Akses ditolak" });

        await member.destroy();
        res.json({ message: "Berhasil dihapus" });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};