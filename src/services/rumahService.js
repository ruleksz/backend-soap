const Rumah = require("../models/Rumah");
const Properti = require("../models/Properti");

// helper convert image
const convertImage = (json) => {
    if (json.image) {
        json.image = `data:image/jpeg;base64,${json.image.toString("base64")}`;
    }
    return json;
};

// GET ALL
exports.getAll = async () => {
    const data = await Rumah.findAll({
        include: [
            {
                model: Properti,
                as: "properti",
                attributes: ["id_properti", "nama_properti"],
            },
        ],
        order: [["id_rumah", "DESC"]],
    });

    return data.map((r) => convertImage(r.toJSON()));
};

// GET BY ID
exports.getById = async (id) => {
    const rumah = await Rumah.findByPk(id, {
        include: [
            {
                model: Properti,
                as: "properti",
                attributes: ["id_properti", "nama_properti"],
            },
        ],
    });

    if (!rumah) {
        throw new Error("Rumah tidak ditemukan");
    }

    return convertImage(rumah.toJSON());
};

// CREATE (SMART)
exports.create = async (body, file) => {
    let {
        tipe,
        deskripsi,
        lb,
        lt,
        jml_kamar,
        jml_lantai,
        harga,
        unit,
        terjual,
        id_properti,
    } = body;

    if (!tipe || !id_properti) {
        throw new Error("Tipe dan properti wajib diisi");
    }

    tipe = tipe.trim();

    const existing = await Rumah.findOne({
        where: {
            tipe,
            id_properti: Number(id_properti),
        },
    });

    // kalau ada → update unit
    if (existing) {
        const newUnit =
            Number(existing.unit || 0) + Number(unit || 0);

        await existing.update({ unit: newUnit });

        return existing;
    }

    // create baru
    return await Rumah.create({
        tipe,
        deskripsi,
        lb: Number(lb),
        lt: Number(lt),
        jml_kamar: Number(jml_kamar),
        jml_lantai: Number(jml_lantai),
        harga: Number(harga),
        unit: Number(unit),
        terjual:
            terjual === true ||
                terjual === "true" ||
                terjual === 1 ||
                terjual === "1"
                ? 1
                : 0,
        id_properti: Number(id_properti),
        image: file ? file.buffer : null,
    });
};

// UPDATE
exports.update = async (id, body, file) => {
    const rumah = await Rumah.findByPk(id);

    if (!rumah) {
        throw new Error("Rumah tidak ditemukan");
    }

    const parseNum = (val, original) => {
        if (val === undefined || val === null || val === "")
            return original;
        return Number(val);
    };

    const parseBool = (val, original) => {
        if (val === undefined) return original;

        return val === "true" ||
            val === "1" ||
            val === true ||
            val === 1
            ? 1
            : 0;
    };

    await rumah.update({
        tipe: body.tipe || rumah.tipe,
        deskripsi: body.deskripsi || rumah.deskripsi,
        lb: parseNum(body.lb, rumah.lb),
        lt: parseNum(body.lt, rumah.lt),
        jml_kamar: parseNum(body.jml_kamar, rumah.jml_kamar),
        jml_lantai: parseNum(body.jml_lantai, rumah.jml_lantai),
        harga: parseNum(body.harga, rumah.harga),
        unit: parseNum(body.unit, rumah.unit),
        terjual: parseBool(body.terjual, rumah.terjual),
        image: file ? file.buffer : rumah.image,
    });

    return rumah;
};

// DELETE
exports.remove = async (id) => {
    const rumah = await Rumah.findByPk(id);

    if (!rumah) {
        throw new Error("Rumah tidak ditemukan");
    }

    await rumah.destroy();
};