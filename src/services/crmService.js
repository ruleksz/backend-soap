const { Crm, Cabuy, Member, Survey } = require("../models");

// GET ALL CRM
exports.getAll = async (user) => {
    const { role } = user;

    if (!["admin", "senior_leader"].includes(role)) {
        throw new Error("Akses ditolak. Hanya admin & senior leader.");
    }

    const data = await Crm.findAll({
        include: [
            {
                model: Member,
                as: "member",
                attributes: ["id_member", "nama"],
            },
            {
                model: Cabuy,
                as: "cabuy",
                attributes: ["id_cabuy", "nama_cabuy"],
            },
        ],
        order: [["id_crm", "DESC"]],
    });

    // convert buffer ke base64
    return data.map((c) => {
        const json = c.toJSON();

        if (json.gambar) {
            json.gambar = Buffer.from(json.gambar).toString("base64");
        }

        return json;
    });
};

// CREATE FROM SURVEY
exports.createFromSurvey = async (id_survey, body, user, file) => {
    const { catatan } = body;
    const { id: userId, role } = user;

    if (!["member", "leader"].includes(role)) {
        throw new Error("Hanya member atau leader yang boleh membuat CRM");
    }

    const survey = await Survey.findByPk(id_survey);

    if (!survey) {
        throw new Error("Survey tidak ditemukan");
    }

    const gambar = file ? file.buffer : null;

    const newCrm = await Crm.create({
        id_member: userId,
        id_cabuy: survey.id_cabuy,
        catatan: catatan || "",
        status: "Open",
        gambar,
    });

    return newCrm;
};

// UPDATE STATUS
exports.updateStatus = async (id, body, user) => {
    const { status } = body;
    const { role } = user;

    if (!["admin", "senior_leader", "leader"].includes(role)) {
        throw new Error("Akses ditolak");
    }

    const crm = await Crm.findByPk(id);

    if (!crm) {
        throw new Error("CRM tidak ditemukan");
    }

    crm.status = status || crm.status;

    await crm.save();

    return crm;
};