const KinerjaMember = require("../models/KinerjaMember");
const Member = require("../models/Member");

// 🔹 GET semua data kinerja member
exports.getAllKinerja = async (req, res) => {
    try {
        const data = await KinerjaMember.findAll({
            include: [
                {
                    model: Member,
                    attributes: [
                        "id_member",
                        "nama",
                        "kontak",
                        "id_admin",
                        "jabatan",
                        "id_leader",   // ✅ FIX: ganti dari leader_id
                        "email",
                    ],
                },
            ],
            order: [["id_kinerja", "DESC"]],
        });

        res.status(200).json({
            success: true,
            message: "Data kinerja member berhasil diambil",
            data,
        });
    } catch (error) {
        console.error("❌ Error getAllKinerja:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data kinerja member",
            error: error.message,
        });
    }
};

// 🔹 GET satu data kinerja member
exports.getKinerjaById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await KinerjaMember.findByPk(id, {
            include: [
                {
                    model: Member,
                    attributes: [
                        "id_member",
                        "nama",
                        "kontak",
                        "id_admin",
                        "jabatan",
                        "id_leader",
                        "email",
                    ],
                },
            ],
        });

        if (!data)
            return res.status(404).json({
                success: false,
                message: "Kinerja member tidak ditemukan",
            });

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("❌ Error getKinerjaById:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data kinerja member",
            error: error.message,
        });
    }
};

// 🔹 CREATE data kinerja
exports.createKinerja = async (req, res) => {
    try {
        const { id_member, jumlah_proyek, jumlah_followup, rate } = req.body;

        const member = await Member.findByPk(id_member);
        if (!member)
            return res.status(404).json({
                success: false,
                message: "Member tidak ditemukan",
            });

        const newKinerja = await KinerjaMember.create({
            id_member,
            jumlah_proyek,
            jumlah_followup,
            rate,
        });

        res.status(201).json({
            success: true,
            message: "Kinerja member berhasil ditambahkan",
            data: newKinerja,
        });
    } catch (error) {
        console.error("❌ Error createKinerja:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menambahkan kinerja member",
            error: error.message,
        });
    }
};

// 🔹 UPDATE data kinerja
exports.updateKinerja = async (req, res) => {
    try {
        const { id } = req.params;
        const { jumlah_proyek, jumlah_followup, rate } = req.body;

        const kinerja = await KinerjaMember.findByPk(id);
        if (!kinerja)
            return res.status(404).json({
                success: false,
                message: "Kinerja member tidak ditemukan",
            });

        await kinerja.update({
            jumlah_proyek,
            jumlah_followup,
            rate,
        });

        res.status(200).json({
            success: true,
            message: "Data kinerja member berhasil diperbarui",
            data: kinerja,
        });
    } catch (error) {
        console.error("❌ Error updateKinerja:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui data kinerja member",
            error: error.message,
        });
    }
};

// 🔹 DELETE data kinerja
exports.deleteKinerja = async (req, res) => {
    try {
        const { id } = req.params;

        const kinerja = await KinerjaMember.findByPk(id);
        if (!kinerja)
            return res.status(404).json({
                success: false,
                message: "Kinerja member tidak ditemukan",
            });

        await kinerja.destroy();

        res.status(200).json({
            success: true,
            message: "Kinerja member berhasil dihapus",
        });
    } catch (error) {
        console.error("❌ Error deleteKinerja:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menghapus data kinerja member",
            error: error.message,
        });
    }
};
