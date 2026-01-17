const Survey = require("../models/Survey");
const Member = require("../models/Member");
const Cabuy = require("../models/Cabuy");
const Rumah = require("../models/Rumah");
const Properti = require("../models/Properti");

/* =========================
   HELPER FORMAT DATETIME
========================= */
const formatDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);

    if (isNaN(d.getTime())) return null;

    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/* =========================
   INCLUDE RELATIONS
========================= */
const surveyIncludes = [
    {
        model: Member,
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
];

/* ======================================================
   🔹 GET ALL SURVEY  (ADMIN MONITORING)
====================================================== */
exports.getAllSurvey = async (req, res) => {
    try {
        const data = await Survey.findAll({
            include: surveyIncludes,
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

/* ======================================================
   🔹 GET SURVEY BY ID
====================================================== */
exports.getSurveyById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Survey.findByPk(id, {
            include: surveyIncludes,
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Survey tidak ditemukan",
            });
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

/* ======================================================
   🔹 GET SURVEY BY LEADER (READ ONLY)
   /survey/leader/:id_member
====================================================== */
exports.getSurveyByLeader = async (req, res) => {
    try {
        const { id_member } = req.params;

        if (!id_member) {
            return res.status(400).json({
                success: false,
                message: "ID member wajib diisi",
            });
        }

        const data = await Survey.findAll({
            where: { id_member },
            include: [
                {
                    model: Member,
                    attributes: ["id_member", "nama"],
                },
                {
                    model: Cabuy,
                    attributes: ["id_cabuy", "nama_cabuy", "kontak"],
                },
                {
                    model: Rumah,
                    attributes: [
                        "id_rumah",
                        "tipe",
                        "image",
                        "id_properti",
                    ],
                    include: [
                        {
                            model: Properti,               // 🔥 ambil dari relasi rumah → properti
                            as: "properti",
                            attributes: ["id_properti", "lokasi"], // lokasi ada di sini
                        },
                    ],
                },
            ],
            order: [["tanggal_survey", "ASC"]],
        });

        // 🔥 convert image buffer → base64
        const result = data.map((row) => {
            const json = row.toJSON();

            if (json.Rumah?.image && Buffer.isBuffer(json.Rumah.image)) {
                json.Rumah.image =
                    `data:image/jpeg;base64,${json.Rumah.image.toString("base64")}`;
            }

            return json;
        });

        return res.status(200).json({
            success: true,
            message: "Jadwal survey leader berhasil diambil",
            data: result,
        });
    } catch (error) {
        console.error("❌ getSurveyByLeader ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil jadwal survey leader",
            error: error.message,
        });
    }
};

// ===============================
// UPDATE STATUS ONLY (LEADER)
// ===============================
exports.updateSurveyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_survey } = req.body;

        if (!["Belum", "Sudah"].includes(status_survey)) {
            return res.status(400).json({
                success: false,
                message: "Status tidak valid",
            });
        }

        const survey = await Survey.findByPk(id);
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "Survey tidak ditemukan",
            });
        }

        await survey.update({ status_survey });

        res.json({
            success: true,
            message: "Status survey berhasil diperbarui",
            data: survey,
        });
    } catch (error) {
        console.error("❌ updateSurveyStatus:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui status survey",
            error: error.message,
        });
    }
};

/* ======================================================
   🔹 CREATE SURVEY  (ADMIN ONLY)
====================================================== */
exports.createSurvey = async (req, res) => {
    try {
        const { id_cabuy, id_member, id_rumah, status_survey, tanggal_survey } =
            req.body;

        if (!id_cabuy || !id_member || !id_rumah) {
            return res.status(400).json({
                success: false,
                message: "id_cabuy, id_member, dan id_rumah wajib diisi",
            });
        }

        /* --- VALIDASI RELASI --- */
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

/* ======================================================
   🔹 UPDATE SURVEY  (ADMIN ONLY)
====================================================== */
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

        /* --- VALIDASI RELASI JIKA DIUBAH --- */
        if (id_cabuy && !(await Cabuy.findByPk(id_cabuy))) {
            return res.status(400).json({
                success: false,
                message: "Cabuy tidak valid",
            });
        }
        if (id_member && !(await Member.findByPk(id_member))) {
            return res.status(400).json({
                success: false,
                message: "Member tidak valid",
            });
        }
        if (id_rumah && !(await Rumah.findByPk(id_rumah))) {
            return res.status(400).json({
                success: false,
                message: "Rumah tidak valid",
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

/* ======================================================
   🔹 DELETE SURVEY  (ADMIN ONLY)
====================================================== */
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

        res.status(200).json({
            success: true,
            message: "Data survey berhasil dihapus",
        });
    } catch (error) {
        console.error("❌ Error deleteSurvey:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menghapus data survey",
            error: error.message,
        });
    }
};
