// file: controllers/surveyController.js
const Survey = require("../models/Survey");
const Member = require("../models/Member");
const Cabuy = require("../models/Cabuy");
const Rumah = require("../models/Rumah");

//
// 📌 Helper format datetime
//
const formatDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

//
// 🔹 GET semua data survey (ADMIN MONITORING)
//
exports.getAllSurvey = async (req, res) => {
    try {
        const data = await Survey.findAll({
            include: [
                {
                    model: Member,
                    // ⚠️ pakai kolom yang benar di tabel member
                    attributes: ["id_member", "nama", "kontak"],
                },
                {
                    model: Cabuy,
                    attributes: ["id_cabuy", "nama_cabuy", "kontak", "status"],
                },
                {
                    model: Rumah,
                    attributes: [
                        "id_rumah",
                        "tipe",
                        "lt",
                        "lb",
                        "jml_kamar",
                        "jml_lantai",
                        "image",
                        "id_properti",
                    ],
                },
            ],
            order: [["id_survey", "ASC"]],
        });

        res.status(200).json({
            success: true,
            message: "Data survey berhasil diambil",
            data,
        });
    } catch (error) {
        console.error("❌ Error getAllSurvey:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data survey",
            error: error.message,
        });
    }
};

//
// 🔹 GET satu data survey berdasarkan ID
//
exports.getSurveyById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Survey.findByPk(id, {
            include: [
                {
                    model: Member,
                    attributes: ["id_member", "nama"],
                },
                {
                    model: Cabuy,
                    attributes: ["id_cabuy", "nama"],
                },
                {
                    model: Rumah,
                    attributes: [
                        "id_rumah",
                        "tipe",
                        "lt",
                        "lb",
                        "jml_kamar",
                        "jml_lantai",
                        "image",
                        "id_properti",
                    ],
                },
            ],
        });

        if (!data) {
            return res
                .status(404)
                .json({ success: false, message: "Survey tidak ditemukan" });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("❌ Error getSurveyById:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data survey",
            error: error.message,
        });
    }
};

//
// 🔹 CREATE data survey baru
//
exports.createSurvey = async (req, res) => {
    try {
        const { id_cabuy, id_member, id_rumah, status_survey, tanggal_survey } =
            req.body;

        // 🔸 Validasi foreign key
        const [cabuy, member, rumah] = await Promise.all([
            Cabuy.findByPk(id_cabuy),
            Member.findByPk(id_member),
            Rumah.findByPk(id_rumah),
        ]);

        if (!cabuy || !member || !rumah) {
            return res.status(400).json({
                success: false,
                message: "Data relasi (Cabuy, Member, Rumah) tidak valid",
            });
        }

        const newSurvey = await Survey.create({
            id_cabuy,
            id_member,
            id_rumah,
            status_survey: status_survey || "Belum",
            tanggal_survey: formatDateTime(tanggal_survey),
        });

        res.status(201).json({
            success: true,
            message: "Data survey berhasil ditambahkan",
            data: newSurvey,
        });
    } catch (error) {
        console.error("❌ Error createSurvey:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menambahkan data survey",
            error: error.message,
        });
    }
};

//
// 🔹 UPDATE data survey
//
exports.updateSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_cabuy, id_member, id_rumah, status_survey, tanggal_survey } =
            req.body;

        const survey = await Survey.findByPk(id);
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "Data survey tidak ditemukan",
            });
        }

        await survey.update({
            id_cabuy: id_cabuy ?? survey.id_cabuy,
            id_member: id_member ?? survey.id_member,
            id_rumah: id_rumah ?? survey.id_rumah,
            status_survey: status_survey ?? survey.status_survey,
            tanggal_survey: tanggal_survey
                ? formatDateTime(tanggal_survey)
                : survey.tanggal_survey,
        });

        res.status(200).json({
            success: true,
            message: "Data survey berhasil diperbarui",
            data: survey,
        });
    } catch (error) {
        console.error("❌ Error updateSurvey:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui data survey",
            error: error.message,
        });
    }
};

//
// 🔹 DELETE data survey
//
exports.deleteSurvey = async (req, res) => {
    try {
        const { id } = req.params;

        const survey = await Survey.findByPk(id);
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "Data survey tidak ditemukan",
            });
        }

        await survey.destroy();

        res
            .status(200)
            .json({ success: true, message: "Data survey berhasil dihapus" });
    } catch (error) {
        console.error("❌ Error deleteSurvey:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menghapus data survey",
            error: error.message,
        });
    }
};
