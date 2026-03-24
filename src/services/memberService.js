const { Member, Cabuy } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN
exports.login = async ({ email, password }) => {
    const member = await Member.findOne({ where: { email } });

    if (!member) {
        throw new Error("Email tidak terdaftar");
    }

    const isValid = await bcrypt.compare(password, member.password);

    if (!isValid) {
        throw new Error("Password salah");
    }

    const token = jwt.sign(
        { id: member.id_member, role: member.jabatan },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        message: "Login berhasil",
        token,
        id: member.id_member,
        nama: member.nama,
        role: member.jabatan,
        email: member.email,
    };
};

// GET MEMBERS
exports.getMembers = async (user) => {
    const { id, role } = user;
    let result = [];

    if (role === "admin") {
        result = await Member.findAll({
            where: { jabatan: "member" },
            order: [["id_member", "DESC"]],
        });
    }

    else if (role === "senior_leader") {
        const leaders = await Member.findAll({
            where: { id_senior: id, jabatan: "leader" },
            attributes: ["id_member"],
        });

        const leaderIds = leaders.map(l => l.id_member);

        result = await Member.findAll({
            where: {
                jabatan: "member",
                id_leader: leaderIds,
            },
            order: [["id_member", "DESC"]],
        });
    }

    else if (role === "leader") {
        result = await Member.findAll({
            where: {
                jabatan: "member",
                id_leader: id,
            },
            order: [["id_member", "DESC"]],
        });
    }

    else {
        throw new Error("Role tidak diizinkan");
    }

    return result;
};

// CREATE MEMBER
exports.create = async (body, creator) => {
    const { nama, email, password, kontak, jabatan } = body;

    if (!["admin", "senior_leader", "leader"].includes(creator.role)) {
        throw new Error("Tidak punya akses");
    }

    if (creator.role === "leader" && jabatan !== "member") {
        throw new Error("Leader hanya boleh menambah MEMBER");
    }

    if (creator.role === "senior_leader" && jabatan !== "leader") {
        throw new Error("Senior Leader hanya boleh menambah LEADER");
    }

    const adminAllowed = ["senior_leader", "leader", "member"];
    if (creator.role === "admin" && !adminAllowed.includes(jabatan)) {
        throw new Error("Jabatan tidak valid");
    }

    const hashed = await bcrypt.hash(password, 10);

    const data = {
        nama,
        email,
        kontak: kontak || "",
        password: hashed,
        jabatan,
        id_admin: null,
        id_senior: null,
        id_leader: null,
    };

    // ADMIN
    if (creator.role === "admin") {
        data.id_admin = creator.id;

        if (jabatan === "leader" && body.id_senior) {
            data.id_senior = body.id_senior;
        }

        if (jabatan === "member" && body.id_leader) {
            data.id_leader = body.id_leader;

            const leaderData = await Member.findByPk(body.id_leader);
            if (leaderData?.id_senior) {
                data.id_senior = leaderData.id_senior;
            }
        }
    }

    // SENIOR
    if (creator.role === "senior_leader") {
        data.jabatan = "leader";
        data.id_senior = creator.id;
    }

    // LEADER
    if (creator.role === "leader") {
        data.jabatan = "member";
        data.id_leader = creator.id;

        const leaderData = await Member.findByPk(creator.id);
        if (leaderData?.id_senior) {
            data.id_senior = leaderData.id_senior;
        }
    }

    return await Member.create(data);
};

// UPDATE
exports.update = async (id, body, user) => {
    const { nama, email, password, kontak } = body;

    if (!["admin", "leader"].includes(user.role)) {
        throw new Error("Tidak punya akses");
    }

    const member = await Member.findByPk(id);

    if (!member) {
        throw new Error("Member tidak ditemukan");
    }

    if (nama) member.nama = nama;
    if (email) member.email = email;
    if (kontak) member.kontak = kontak;

    if (password) {
        member.password = await bcrypt.hash(password, 10);
    }

    await member.save();

    return member;
};

// DELETE
exports.remove = async (id, user) => {
    if (!["admin", "leader"].includes(user.role)) {
        throw new Error("Tidak punya akses");
    }

    const member = await Member.findByPk(id);

    if (!member) {
        throw new Error("Member tidak ditemukan");
    }

    await member.destroy();
};

// GET LEADERS
exports.getLeadersBySenior = async (user) => {
    const { id, role } = user;

    if (!["admin", "senior_leader"].includes(role)) {
        throw new Error("Akses ditolak");
    }

    let whereClause = { jabatan: "leader" };

    if (role === "senior_leader") {
        whereClause.id_senior = id;
    }

    const leaders = await Member.findAll({
        where: whereClause,
        include: [
            {
                model: Member,
                as: "members_bawahan",
                attributes: ["id_member"],
            },
        ],
        order: [["id_member", "DESC"]],
    });

    return leaders.map((l) => {
        const data = l.toJSON();

        return {
            ...data,
            total_members: data.members_bawahan
                ? data.members_bawahan.length
                : 0,
        };
    });
};

// GET LEADER MEMBER CABUY
exports.getLeadersMembersCabuys = async (user) => {
    if (user.role !== "admin") {
        throw new Error("Akses ditolak");
    }

    return await Member.findAll({
        where: { jabatan: "leader" },
        attributes: ["id_member", "nama", "email"],
        include: [
            {
                model: Member,
                as: "members_bawahan",
                where: { jabatan: "member" },
                required: false,
                attributes: ["id_member", "nama", "email", "kontak"],
                include: [
                    {
                        model: Cabuy,
                        as: "cabuys",
                        attributes: [
                            "id_cabuy",
                            "nama_cabuy",
                            "kontak",
                            "status",
                            "tanggal_masuk",
                        ],
                    },
                ],
            },
        ],
        order: [["id_member", "DESC"]],
    });
};

// GET SENIOR
exports.getSeniorLeaders = async (user) => {
    if (user.role !== "admin") {
        throw new Error("Akses ditolak");
    }

    return await Member.findAll({
        where: { jabatan: "senior_leader" },
        order: [["id_member", "DESC"]],
    });
};