const Member = require("../models/Member.js");
const Rumah = require("../models/Rumah.js");
const Survey = require("../models/Survey.js");
const Properti = require("../models/Properti.js");
const Cabuy = require("../models/Cabuy.js");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;

    // 🔒 hanya admin
    if (role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [
      totalMembers,
      totalRumah,
      totalSurvey,
      totalProperti,
      totalCabuy,
    ] = await Promise.all([
      Member.count(),            // semua member
      Rumah.count(),             // semua rumah
      Survey.count(),            // semua survey
      Properti.count(),          // semua properti
      Cabuy.count(),          // semua cabuy
    ]);

    res.json({
      senior_leaderCount: totalMembers,
      rumahCount: totalRumah,
      surveyCount: totalSurvey,
      propertiCount: totalProperti,
      cabuyCount: totalCabuy,
    });
  } catch (err) {
    console.error("Dashboard Admin Error:", err);
    res.status(500).json({
      message: "Gagal memuat data dashboard",
      error: err.message,
    });
  }
};