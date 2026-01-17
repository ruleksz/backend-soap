const { Agent, Rumah, Member } = require("../models");

/* =============================
   GET /api/agent
   ============================= */
exports.getAllAgents = async (req, res) => {
    try {
        const data = await Agent.findAll({
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

        res.json({ data });
    } catch (err) {
        console.error("Error getAllAgents:", err);
        res.status(500).json({ message: "Gagal mengambil data agent" });
    }
};

/* =============================
   GET /api/agent/:id
   ============================= */
exports.getAgentById = async (req, res) => {
    try {
        const agent = await Agent.findByPk(req.params.id, {
            include: [
                { model: Rumah, as: "rumah" },
                { model: Member, as: "member" },
            ],
        });

        if (!agent)
            return res.status(404).json({ message: "Data agent tidak ditemukan" });

        res.json(agent);
    } catch (err) {
        console.error("Error getAgentById:", err);
        res.status(500).json({ message: "Gagal mengambil data agent" });
    }
};

/* =============================
   POST /api/agent
   ============================= */
exports.createAgent = async (req, res) => {
    try {
        const { id_rumah, id_member } = req.body;

        if (!id_rumah)
            return res.status(400).json({ message: "id_rumah wajib diisi" });

        // cek rumah
        const rumah = await Rumah.findByPk(id_rumah);
        if (!rumah)
            return res.status(404).json({ message: "Rumah tidak ditemukan" });

        // cek member (opsional tapi direkomendasikan)
        let memberData = null;
        if (id_member) {
            memberData = await Member.findByPk(id_member);
            if (!memberData)
                return res.status(404).json({ message: "Member tidak ditemukan" });
        }

        const newAgent = await Agent.create({
            id_rumah,
            id_member: id_member || null,
        });

        res.status(201).json({
            message: "Agent berhasil ditambahkan",
            data: newAgent,
        });
    } catch (err) {
        console.error("Error createAgent:", err);
        res.status(500).json({ message: "Gagal menambahkan agent" });
    }
};

/* =============================
   PUT /api/agent/:id
   ============================= */
exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_rumah, id_member } = req.body;

        const agent = await Agent.findByPk(id);
        if (!agent)
            return res.status(404).json({ message: "Agent tidak ditemukan" });

        if (id_rumah !== undefined) {
            const rumah = await Rumah.findByPk(id_rumah);
            if (!rumah)
                return res.status(404).json({ message: "Rumah tidak ditemukan" });
            agent.id_rumah = id_rumah;
        }

        if (id_member !== undefined) {
            if (id_member === null) {
                agent.id_member = null;
            } else {
                const member = await Member.findByPk(id_member);
                if (!member)
                    return res.status(404).json({ message: "Member tidak ditemukan" });
                agent.id_member = id_member;
            }
        }

        await agent.save();

        res.json({
            message: "Agent berhasil diperbarui",
            data: agent,
        });
    } catch (err) {
        console.error("Error updateAgent:", err);
        res.status(500).json({ message: "Gagal memperbarui agent" });
    }
};

/* =============================
   DELETE /api/agent/:id
   ============================= */
exports.deleteAgent = async (req, res) => {
    try {
        const agent = await Agent.findByPk(req.params.id);
        if (!agent)
            return res.status(404).json({ message: "Agent tidak ditemukan" });

        await agent.destroy();
        res.json({ message: "Agent berhasil dihapus" });
    } catch (err) {
        console.error("Error deleteAgent:", err);
        res.status(500).json({ message: "Gagal menghapus agent" });
    }
};
