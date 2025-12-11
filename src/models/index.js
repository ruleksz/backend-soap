// models/index.js
const Admin = require("./Admin");
const Member = require("./Member");
const Cabuy = require("./Cabuy");
const Properti = require("./Properti");
const Rumah = require("./Rumah");

// 1. ADMIN → punya banyak Senior Leader
Admin.hasMany(Member, { foreignKey: "id_admin" });
Member.belongsTo(Admin, { foreignKey: "id_admin" });

// 2. SENIOR LEADER → punya banyak Leader
Member.hasMany(Member, {
  foreignKey: "id_senior",
  as: "leaders_bawahan",
});
Member.belongsTo(Member, {
  foreignKey: "id_senior",
  as: "senior",
});

// 3. LEADER → punya banyak Member (BAWAHAN)
Member.hasMany(Member, {
  foreignKey: "id_leader",
  as: "members_bawahan",
});
Member.belongsTo(Member, {
  foreignKey: "id_leader",
  as: "leader",
});

// 4. MEMBER → punya banyak Leads (Cabuy)
Member.hasMany(Cabuy, {
  foreignKey: "id_member",
  as: "leads",
});
Cabuy.belongsTo(Member, {
  foreignKey: "id_member",
  as: "member",
});

// 5. SENIOR (Member with jabatan='senior_leader') → punya banyak Properti
Member.hasMany(Properti, {
  foreignKey: "id_member",
  as: "propertis", // plural for include convenience
});
Properti.belongsTo(Member, {
  foreignKey: "id_member",
  as: "owner_senior",
});

// 6. Properti → punya banyak Rumah
Properti.hasMany(Rumah, {
  foreignKey: "id_properti",
  as: "rumahs",
});
Rumah.belongsTo(Properti, {
  foreignKey: "id_properti",
  as: "properti",
});

// 7. Rumah juga bisa punya hubungan ke Member (yang mengelola rumah) — optional
Member.hasMany(Rumah, {
  foreignKey: "id_member",
  as: "rumah_binaan",
});
Rumah.belongsTo(Member, {
  foreignKey: "id_member",
  as: "member",
});

module.exports = { Admin, Member, Cabuy, Properti, Rumah };
