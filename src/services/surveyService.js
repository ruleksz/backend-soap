const Survey = require("../models/Survey");
const Member = require("../models/Member");
const Cabuy = require("../models/Cabuy");
const Rumah = require("../models/Rumah");
const Properti = require("../models/Properti");

/* FORMAT DATETIME */
const formatDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);

    if (isNaN(d.getTime())) return null;

    const pad = (n) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
        d.getSeconds()
    )}`;
};

/* INCLUDE */
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

// GET ALL
exports.getAll = async () => {
    return await Survey.findAll({
        include: surveyIncludes,
        order: [["id_survey", "ASC"]],
    });
};

// GET BY ID
exports.getById = async (id) => {
    const data = await Survey.findByPk(id, {
        include: surveyIncludes,
    });

    if (!data) {
        throw new Error("Survey tidak ditemukan");
    }

    return data;
};

// GET BY LEADER
exports.getByLeader = async (id_member) => {
    if (!id_member) {
        throw new Error("ID member wajib diisi");
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
                attributes: ["id_rumah", "tipe", "image", "id_properti"],
                include: [
                    {
                        model: Properti,
                        as: "properti",
                        attributes: ["id_properti", "lokasi"],
                    },
                ],
            },
        ],
        order: [["tanggal_survey", "ASC"]],
    });

    return data.map((row) => {
        const json = row.toJSON();

        if (json.Rumah?.image && Buffer.isBuffer(json.Rumah.image)) {
            json.Rumah.image =
                `data:image/jpeg;base64,${json.Rumah.image.toString(
                    "base64"
                )}`;
        }

        return json;
    });
};

// UPDATE STATUS
exports.updateStatus = async (id, status_survey) => {
    if (!["Belum", "Sudah"].includes(status_survey)) {
        throw new Error("Status tidak valid");
    }

    const survey = await Survey.findByPk(id);

    if (!survey) {
        throw new Error("Survey tidak ditemukan");
    }

    await survey.update({ status_survey });

    return survey;
};

// CREATE
exports.create = async (body) => {
    const {
        id_cabuy,
        id_member,
        id_rumah,
        status_survey,
        tanggal_survey,
    } = body;

    if (!id_cabuy || !id_member || !id_rumah) {
        throw new Error(
            "id_cabuy, id_member, dan id_rumah wajib diisi"
        );
    }

    const [cabuy, member, rumah] = await Promise.all([
        Cabuy.findByPk(id_cabuy),
        Member.findByPk(id_member),
        Rumah.findByPk(id_rumah),
    ]);

    if (!cabuy || !member || !rumah) {
        throw new Error("Data relasi tidak valid");
    }

    return await Survey.create({
        id_cabuy,
        id_member,
        id_rumah,
        status_survey: status_survey || "Belum",
        tanggal_survey: formatDateTime(tanggal_survey),
    });
};

// UPDATE
exports.update = async (id, body) => {
    const survey = await Survey.findByPk(id);

    if (!survey) {
        throw new Error("Data survey tidak ditemukan");
    }

    const {
        id_cabuy,
        id_member,
        id_rumah,
        status_survey,
        tanggal_survey,
    } = body;

    if (id_cabuy && !(await Cabuy.findByPk(id_cabuy))) {
        throw new Error("Cabuy tidak valid");
    }

    if (id_member && !(await Member.findByPk(id_member))) {
        throw new Error("Member tidak valid");
    }

    if (id_rumah && !(await Rumah.findByPk(id_rumah))) {
        throw new Error("Rumah tidak valid");
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

    return survey;
};

// DELETE
exports.remove = async (id) => {
    const survey = await Survey.findByPk(id);

    if (!survey) {
        throw new Error("Data survey tidak ditemukan");
    }

    await survey.destroy();
};