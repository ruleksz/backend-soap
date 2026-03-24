const Member = require("../models/Member");
const Rumah = require("../models/Rumah");
const Survey = require("../models/Survey");
const Properti = require("../models/Properti");
const Cabuy = require("../models/Cabuy");

exports.getAdminStats = async (user) => {
    const { role } = user;

    // hanya admin
    if (role !== "admin") {
        throw new Error("Akses ditolak");
    }

    const [
        totalMembers,
        totalRumah,
        totalSurvey,
        totalProperti,
        totalCabuy,
    ] = await Promise.all([
        Member.count(),
        Rumah.count(),
        Survey.count(),
        Properti.count(),
        Cabuy.count(),
    ]);

    return {
        senior_leaderCount: totalMembers,
        rumahCount: totalRumah,
        surveyCount: totalSurvey,
        propertiCount: totalProperti,
        cabuyCount: totalCabuy,
    };
};