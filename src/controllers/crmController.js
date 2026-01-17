const { Crm, Cabuy, Member, Survey } = require("../models");

/* ===============================
   GET ALL CRM
   ➜ hanya ADMIN & SENIOR LEADER
================================ */
exports.getAllCrm = async (req, res) => {
    try {
        const { role } = req.user;

        // 🔒 role check
        if (!["admin", "senior_leader"].includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak. Hanya admin & senior leader.",
            });
        }

        const data = await Crm.findAll({
            include: [
                { model: Member, as: "member", attributes: ["id_member", "nama"] },
                { model: Cabuy, as: "cabuy", attributes: ["id_cabuy", "nama_cabuy"] },
            ],
            order: [["id_crm", "DESC"]],
        });

        // 🔥 convert buffer → base64 (kalau ada gambar)
        const formatted = data.map((c) => {
            const json = c.toJSON();
            if (json.gambar) {
                json.gambar = Buffer.from(json.gambar).toString("base64");
            }
            return json;
        });

        return res.status(200).json({
            success: true,
            message: "Data CRM berhasil diambil",
            data: formatted,
        });
    } catch (error) {
        console.error("❌ Error getAllCrm:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data CRM",
            error: error.message,
        });
    }
};

/* ===============================
   CREATE CRM FROM SURVEY
   POST /crm/from-survey/:id_survey
================================ */
exports.createFromSurvey = async (req, res) => {
    try {
        const { id_survey } = req.params;
        const { catatan } = req.body;
        const { id: userId, role } = req.user;

        // 🔒 hanya member / leader yg boleh
        if (!["member", "leader"].includes(role)) {
            return res.status(403).json({
                message: "Hanya member atau leader yang boleh membuat CRM",
            });
        }

        const survey = await Survey.findByPk(id_survey);
        if (!survey) {
            return res.status(404).json({ message: "Survey tidak ditemukan" });
        }

        const gambar = req.file ? req.file.buffer : null;

        const newCrm = await Crm.create({
            id_member: userId,
            id_cabuy: survey.id_cabuy,
            catatan: catatan || "",
            status: "Open",
            gambar,
        });

        return res.status(201).json({
            message: "CRM berhasil dibuat dari survey",
            data: newCrm,
        });
    } catch (error) {
        console.error("❌ Error createFromSurvey:", error);
        return res.status(500).json({
            message: "Gagal membuat CRM",
            error: error.message,
        });
    }
};

/* ===============================
   UPDATE STATUS CRM
   PUT /crm/:id
================================ */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { role } = req.user;

        // 🔒 hanya admin, senior leader, leader
        if (!["admin", "senior_leader", "leader"].includes(role)) {
            return res.status(403).json({
                message: "Akses ditolak",
            });
        }

        const crm = await Crm.findByPk(id);
        if (!crm) {
            return res.status(404).json({ message: "CRM tidak ditemukan" });
        }

        crm.status = status || crm.status;
        await crm.save();

        return res.status(200).json({
            message: "Status CRM berhasil diperbarui",
            data: crm,
        });
    } catch (error) {
        console.error("❌ Error updateStatus:", error);
        return res.status(500).json({
            message: "Gagal update CRM",
            error: error.message,
        });
    }
};
