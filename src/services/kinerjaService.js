const KinerjaMember = require("../models/KinerjaMember");
const Member = require("../models/Member");

// GET ALL
exports.getAll = async () => {
    return await KinerjaMember.findAll({
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
        order: [["id_kinerja", "DESC"]],
    });
};

// GET BY ID
exports.getById = async (id) => {
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

    if (!data) {
        throw new Error("Kinerja member tidak ditemukan");
    }

    return data;
};

// CREATE
exports.create = async (body) => {
    const { id_member, jumlah_proyek, jumlah_followup, rate } = body;

    const member = await Member.findByPk(id_member);

    if (!member) {
        throw new Error("Member tidak ditemukan");
    }

    return await KinerjaMember.create({
        id_member,
        jumlah_proyek,
        jumlah_followup,
        rate,
    });
};

// UPDATE
exports.update = async (id, body) => {
    const { jumlah_proyek, jumlah_followup, rate } = body;

    const kinerja = await KinerjaMember.findByPk(id);

    if (!kinerja) {
        throw new Error("Kinerja member tidak ditemukan");
    }

    await kinerja.update({
        jumlah_proyek,
        jumlah_followup,
        rate,
    });

    return kinerja;
};

// DELETE
exports.remove = async (id) => {
    const kinerja = await KinerjaMember.findByPk(id);

    if (!kinerja) {
        throw new Error("Kinerja member tidak ditemukan");
    }

    await kinerja.destroy();
};