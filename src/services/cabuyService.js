const { Cabuy, Rumah, Agent } = require("../models");

// ENUM
const ALLOWED_STATUS = [
    "Baru",
    "Follow Up",
    "Siap Survey",
    "Booking",
    "Closing",
    "Lost",
];

const MAP_STATUS = {
    deal: "Closing",
    closed: "Closing",
    baru: "Baru",
    survey: "Siap Survey",
    siap_survey: "Siap Survey",
};

// GET ALL
exports.getAll = async (user) => {
    const { id, role } = user;

    let whereClause = {};
    if (role === "member") {
        whereClause = { id_member: id };
    }

    return await Cabuy.findAll({
        where: whereClause,
        include: [{ model: Rumah, as: "rumah" }],
        order: [["tanggal_masuk", "DESC"]],
    });
};

// GET BY AGENT
exports.getByAgent = async (user) => {
    const { id, role } = user;

    if (role !== "member") {
        throw new Error("Akses ditolak");
    }

    return await Cabuy.findAll({
        where: { id_member: id },
        include: [{ model: Rumah, as: "rumah" }],
    });
};

// GET FOR SENIOR
exports.getForSenior = async (user) => {
    const { role } = user;

    if (role !== "senior_leader") {
        throw new Error("Akses ditolak");
    }

    const statusAllowed = [
        "Follow Up",
        "Siap Survey",
        "Booking",
        "Closing",
        "Lost",
    ];

    return await Cabuy.findAll({
        where: { status: statusAllowed },
        include: [
            {
                model: Rumah,
                as: "rumah",
                attributes: ["id_rumah", "tipe", "harga"],
            },
        ],
        order: [["tanggal_masuk", "DESC"]],
    });
};

// GET BY ID
exports.getById = async (id) => {
    const cabuy = await Cabuy.findByPk(id, {
        include: [{ model: Rumah, as: "rumah" }],
    });

    if (!cabuy) {
        throw new Error("Cabuy tidak ditemukan");
    }

    return cabuy;
};

// CREATE
exports.create = async (data) => {
    const {
        nama_cabuy,
        kontak,
        status = "Baru",
        tanggal_follow_up,
        id_rumah,
    } = data;

    if (!nama_cabuy || !kontak || !id_rumah) {
        throw new Error("Field wajib belum lengkap");
    }

    const agent = await Agent.findOne({ where: { id_rumah } });

    if (!agent) {
        throw new Error("Rumah ini belum memiliki agent");
    }

    return await Cabuy.create({
        nama_cabuy,
        kontak,
        status,
        tanggal_follow_up: tanggal_follow_up || null,
        id_rumah,
        id_member: agent.id_member,
    });
};

// UPDATE
exports.update = async (id, body) => {
    const cabuy = await Cabuy.findByPk(id);

    if (!cabuy) {
        throw new Error("Cabuy tidak ditemukan");
    }

    const { nama_cabuy, kontak, status, tanggal_follow_up } = body;

    let normalizedStatus = cabuy.status;

    if (status) {
        if (ALLOWED_STATUS.includes(status)) {
            normalizedStatus = status;
        } else if (MAP_STATUS[status.toLowerCase()]) {
            normalizedStatus = MAP_STATUS[status.toLowerCase()];
        }
    }

    await cabuy.update({
        nama_cabuy: nama_cabuy ?? cabuy.nama_cabuy,
        kontak: kontak ?? cabuy.kontak,
        tanggal_follow_up:
            tanggal_follow_up === ""
                ? null
                : tanggal_follow_up ?? cabuy.tanggal_follow_up,
        status: normalizedStatus,
    });

    return cabuy;
};

// DELETE
exports.remove = async (id) => {
    const cabuy = await Cabuy.findByPk(id);

    if (!cabuy) {
        throw new Error("Cabuy tidak ditemukan");
    }

    await cabuy.destroy();
};