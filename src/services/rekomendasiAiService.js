const Rekomendasi_ai = require("../models/Rekomendasi_ai");
const Cabuy = require("../models/Cabuy");
const Properti = require("../models/Properti");

// GET ALL
exports.getAll = async () => {
    return await Rekomendasi_ai.findAll({
        include: [
            { model: Cabuy, attributes: ["id_cabuy", "nama_cabuy"] },
            { model: Properti, attributes: ["id_properti", "nama_properti"] },
        ],
        order: [["id_rekomendasi", "DESC"]],
    });
};

// GET BY ID
exports.getById = async (id) => {
    const data = await Rekomendasi_ai.findByPk(id, {
        include: [
            { model: Cabuy, attributes: ["id_cabuy", "nama_cabuy"] },
            { model: Properti, attributes: ["id_properti", "nama_properti"] },
        ],
    });

    if (!data) {
        throw new Error("Rekomendasi AI tidak ditemukan");
    }

    return data;
};

// CREATE
exports.create = async (body) => {
    const { skor, id_cabuy, id_properti } = body;

    return await Rekomendasi_ai.create({
        skor,
        id_cabuy,
        id_properti,
    });
};

// UPDATE
exports.update = async (id, body) => {
    const { skor, id_cabuy, id_properti } = body;

    const rekomendasi = await Rekomendasi_ai.findByPk(id);

    if (!rekomendasi) {
        throw new Error("Rekomendasi AI tidak ditemukan");
    }

    await rekomendasi.update({
        skor,
        id_cabuy,
        id_properti,
    });

    return rekomendasi;
};

// DELETE
exports.remove = async (id) => {
    const rekomendasi = await Rekomendasi_ai.findByPk(id);

    if (!rekomendasi) {
        throw new Error("Rekomendasi AI tidak ditemukan");
    }

    await rekomendasi.destroy();
};