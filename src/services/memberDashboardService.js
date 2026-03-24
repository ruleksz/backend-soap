const Member = require("../models/Member");
const Properti = require("../models/Properti");
const Survey = require("../models/Survey");
const Rumah = require("../models/Rumah");

exports.getStats = async (user) => {
    const memberId = user?.id;

    const [leaderCount, projectCount, surveyCount, propertiCount] =
        await Promise.all([
            Member.count({ where: { jabatan: "leader" } }),
            Rumah.count(),
            Survey.count({
                where: memberId ? { id_member: memberId } : {},
            }),
            Properti.count(),
        ]);

    return {
        leaderCount,
        projectCount,
        surveyCount,
        propertiCount,
    };
};