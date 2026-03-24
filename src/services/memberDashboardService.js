const Properti = require("../models/Properti");
const Survey = require("../models/Survey");
const Rumah = require("../models/Rumah");
const Crm = require("../models/Crm");

exports.getStats = async (user, query) => {
    const memberId = user?.id || query.id_member;

    const [crmCount, propertiCount, surveyCount, rumahCount] =
        await Promise.all([
            Crm.count({
                where: memberId ? { id_member: memberId } : {},
            }),

            Properti.count({
                where: memberId ? { id_member: memberId } : {},
            }),

            Survey.count({
                where: memberId ? { id_member: memberId } : {},
            }),

            Rumah.count({
                where: memberId ? { id_member: memberId } : {},
            }),
        ]);

    return {
        crmCount,
        propCount: propertiCount,
        surveyCount,
        rumahCount,
    };
};