// controllers/rumahController.js
const Rumah = require("../models/Rumah");
const Properti = require("../models/Properti");
const multer = require("multer");

/* =========================
   MULTER (IMAGE TO BUFFER)
========================= */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =========================
   GET ALL RUMAH
========================= */
exports.getAllRumah = async (req, res) => {
  try {
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

    const result = data.map((r) => {
      const json = r.toJSON();
      if (json.image) {
        json.image = `data:image/jpeg;base64,${json.image.toString("base64")}`;
      }
      return json;
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("🔥 getAllRumah Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data rumah",
    });
  }
};

/* =========================
   GET RUMAH BY ID
========================= */
exports.getRumahById = async (req, res) => {
  try {
    const rumah = await Rumah.findByPk(req.params.id, {
      include: [
        {
          model: Properti,
          as: "properti",
          attributes: ["id_properti", "nama_properti"],
        },
      ],
    });

    if (!rumah) {
      return res.status(404).json({
        success: false,
        message: "Rumah tidak ditemukan",
      });
    }

    const data = rumah.toJSON();
    if (data.image) {
      data.image = `data:image/jpeg;base64,${data.image.toString("base64")}`;
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("🔥 getRumahById Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail rumah",
    });
  }
};

/* =========================
   CREATE RUMAH (SMART LOGIC)
   - Jika TIPE + PROPERTI SUDAH ADA
     → TAMBAH UNIT (UPDATE)
   - Jika BELUM ADA
     → INSERT BARU
========================= */
exports.createRumah = [
  upload.single("image"),
  async (req, res) => {
    try {
      let {
        tipe,
        lb,
        lt,
        jml_kamar,
        jml_lantai,
        harga,
        unit,
        terjual,
        id_properti,
      } = req.body;

      if (!tipe || !id_properti) {
        return res.status(400).json({
          success: false,
          message: "Tipe dan properti wajib diisi",
        });
      }

      tipe = tipe.trim();

      /* 🔍 CEK APAKAH TIPE SUDAH ADA DI PROPERTI INI */
      const existing = await Rumah.findOne({
        where: {
          tipe,
          id_properti: Number(id_properti),
        },
      });

      /* ===============================
         JIKA SUDAH ADA → UPDATE UNIT
      =============================== */
      if (existing) {
        const newUnit =
          Number(existing.unit || 0) + Number(unit || 0);

        await existing.update({ unit: newUnit });

        return res.status(200).json({
          success: true,
          message: "Unit rumah berhasil ditambahkan",
          data: existing,
        });
      }

      /* ===============================
         JIKA BELUM ADA → INSERT BARU
      =============================== */
      const rumah = await Rumah.create({
        tipe,
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
        image: req.file ? req.file.buffer : null,
      });

      res.status(201).json({
        success: true,
        message: "Rumah berhasil ditambahkan",
        data: rumah,
      });
    } catch (err) {
      console.error("🔥 createRumah Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal menambahkan rumah",
        error: err.message,
      });
    }
  },
];

/* =========================
   UPDATE RUMAH
========================= */
/* =========================
   UPDATE RUMAH (FIXED)
========================= */
exports.updateRumah = [
  upload.single("image"), // Middleware Multer
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // 1. Cek apakah Rumah ada
      const rumah = await Rumah.findByPk(id);
      if (!rumah) {
        return res.status(404).json({
          success: false,
          message: "Rumah tidak ditemukan",
        });
      }

      // 2. Parsing Data (PENTING untuk FormData)
      // Karena FormData mengirim "null" atau "undefined" sebagai STRING, kita harus hati-hati.
      const body = req.body;

      // Helper function untuk parsing angka
      const parseNum = (val, original) => {
        if (val === undefined || val === null || val === "") return original;
        return Number(val);
      };

      // Helper function untuk parsing boolean (terjual)
      const parseBool = (val, original) => {
         if (val === undefined) return original;
         // Cek string "true", "1", atau boolean true
         return (val === "true" || val === "1" || val === true || val === 1) ? 1 : 0;
      };

      // 3. Lakukan Update
      await rumah.update({
        tipe: body.tipe || rumah.tipe, // String aman
        lb: parseNum(body.lb, rumah.lb),
        lt: parseNum(body.lt, rumah.lt),
        jml_kamar: parseNum(body.jml_kamar, rumah.jml_kamar),
        jml_lantai: parseNum(body.jml_lantai, rumah.jml_lantai),
        harga: parseNum(body.harga, rumah.harga),
        unit: parseNum(body.unit, rumah.unit),
        terjual: parseBool(body.terjual, rumah.terjual),
        // Cek apakah ada file baru? Jika tidak, pakai yg lama
        image: req.file ? req.file.buffer : rumah.image,
      });

      res.status(200).json({
        success: true,
        message: "Rumah berhasil diperbarui",
        data: rumah,
      });

    } catch (err) {
      console.error("🔥 updateRumah Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui rumah",
        error: err.message
      });
    }
  },
];

/* =========================
   DELETE RUMAH
========================= */
exports.deleteRumah = async (req, res) => {
  try {
    const rumah = await Rumah.findByPk(req.params.id);
    if (!rumah) {
      return res.status(404).json({
        success: false,
        message: "Rumah tidak ditemukan",
      });
    }

    await rumah.destroy();

    res.status(200).json({
      success: true,
      message: "Rumah berhasil dihapus",
    });
  } catch (err) {
    console.error("🔥 deleteRumah Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus rumah",
    });
  }
};
