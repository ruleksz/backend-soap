const Admin = require("./Admin");
const Member = require("./Member");
const Cabuyan = require("./Cabuy");

// ADMIN → banyak Senior Leader
Admin.hasMany(Member, { foreignKey: "id_admin" });
Member.belongsTo(Admin, { foreignKey: "id_admin" });

// SENIOR LEADER → banyak Leader
Member.hasMany(Member, {
    foreignKey: "id_senior",
    as: "leaders"
});
Member.belongsTo(Member, {
    foreignKey: "id_senior",
    as: "senior"
});

// LEADER → banyak Member
Member.hasMany(Member, {
    foreignKey: "id_leader",
    as: "members"
});
Member.belongsTo(Member, {
    foreignKey: "id_leader",
    as: "leader"
});
Member.belongsTo(Member, {
    foreignKey: "id_member",
    as: "leads"
});
Cabuyan.belongsTo(Member, {
    foreignKey: "id_member",
    as: "member"
});

module.exports = { Admin, Member };
