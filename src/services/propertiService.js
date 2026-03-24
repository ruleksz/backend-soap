const { Properti, Rumah } = require("../models");

/* MIME DETECT */
const detectMimeType = (buffer) => {
    if (!buffer) return null;

    const signature = buffer.toString("hex", 0, 4);

    switch (signature) {
        case "89504e47":
            return "image/png";
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
            return "image/jpeg";
        case "47494638":
            return "image/gif";
        default:
            return "application/octet-stream";
    }
};

/* CONVERT IMAGE */
const convertImage = (json) => {
    if (json.image && Buffer.isBuffer(json.image)) {
        const mime = detectMimeType(json.image);
        json.image = `data:${mime};base64,${json.image.toString("base64")}`;
    }
    return json;
};

// GET ALL
exports.getAll = async () => {
    const data = await Properti.findAll({
        include: [{ model: Rumah, as: "rumahs" }],
        order: [["id_properti", "DESC"]],
    });

    return data.map((item) => convertImage(item.toJSON()));
};

// GET BY ID
exports.getById = async (id) => {
    const data = await Properti.findByPk(id, {
        include: [{ model: Rumah, as: "rumahs" }],
    });

    if (!data) {
        throw new Error("Properti tidak ditemukan");
    }

    return convertImage(data.toJSON());
};

// CREATE
exports.create = async (body, file) => {
    const {
        nama_properti,
        deskripsi,
        lokasi,
        kontraktor,
        kontak_kontraktor,
        id_member,
    } = body;

    const image = file ? file.buffer : null;

    const newProperti = await Properti.create({
        nama_properti,
        deskripsi,
        lokasi,
        kontraktor,
        kontak_kontraktor,
        id_member: id_member || null,
        image,
    });

    return convertImage(newProperti.toJSON());
};

// UPDATE
exports.update = async (id, body, file) => {
    const properti = await Properti.findByPk(id);

    if (!properti) {
        throw new Error("Properti tidak ditemukan");
    }

    const payload = {
        nama_properti: body.nama_properti,
        deskripsi: body.deskripsi,
        lokasi: body.lokasi,
        kontraktor: body.kontraktor,
        kontak_kontraktor: body.kontak_kontraktor,
        id_member: body.id_member || null,
    };

    if (file) {
        payload.image = file.buffer;
    }

    await properti.update(payload);

    return convertImage(properti.toJSON());
};

// DELETE
exports.remove = async (id) => {
    const properti = await Properti.findByPk(id);

    if (!properti) {
        throw new Error("Properti tidak ditemukan");
    }

    await properti.destroy();
};