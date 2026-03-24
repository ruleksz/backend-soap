const { Agent, Rumah, Member } = require("../models");

// GET ALL
exports.getAll = async () => {
    return await Agent.findAll({
        include: [
            {
                model: Rumah,
                as: "rumah",
                attributes: ["id_rumah", "tipe", "harga"],
            },
            {
                model: Member,
                as: "member",
                attributes: ["id_member", "nama", "jabatan"],
            },
        ],
        order: [["id_agent", "DESC"]],
    });
};

// GET BY ID
exports.getById = async (id) => {
    const agent = await Agent.findByPk(id, {
        include: [
            { model: Rumah, as: "rumah" },
            { model: Member, as: "member" },
        ],
    });

    if (!agent) {
        throw new Error("Data agent tidak ditemukan");
    }

    return agent;
};

// CREATE
exports.create = async ({ id_rumah, id_member }) => {
    if (!id_rumah) {
        throw new Error("id_rumah wajib diisi");
    }

    const rumah = await Rumah.findByPk(id_rumah);
    if (!rumah) {
        throw new Error("Rumah tidak ditemukan");
    }

    if (id_member) {
        const member = await Member.findByPk(id_member);
        if (!member) {
            throw new Error("Member tidak ditemukan");
        }
    }

    const newAgent = await Agent.create({
        id_rumah,
        id_member: id_member || null,
    });

    return newAgent;
};

// UPDATE
exports.update = async (id, { id_rumah, id_member }) => {
    const agent = await Agent.findByPk(id);
    if (!agent) {
        throw new Error("Agent tidak ditemukan");
    }

    if (id_rumah !== undefined) {
        const rumah = await Rumah.findByPk(id_rumah);
        if (!rumah) {
            throw new Error("Rumah tidak ditemukan");
        }
        agent.id_rumah = id_rumah;
    }

    if (id_member !== undefined) {
        if (id_member === null) {
            agent.id_member = null;
        } else {
            const member = await Member.findByPk(id_member);
            if (!member) {
                throw new Error("Member tidak ditemukan");
            }
            agent.id_member = id_member;
        }
    }

    await agent.save();
    return agent;
};

// DELETE
exports.remove = async (id) => {
    const agent = await Agent.findByPk(id);

    if (!agent) {
        throw new Error("Agent tidak ditemukan");
    }

    await agent.destroy();
};