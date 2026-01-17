const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

// ================= IMPORT MODELS =================
const Admin = require("./Admin");
const Member = require("./Member");
const Cabuy = require("./Cabuy");
const Properti = require("./Properti");
const Rumah = require("./Rumah");
const Survey = require("./Survey");
const Agent = require("./Agent");

// ⚠️ Crm pakai factory pattern
const Crm = require("./Crm")(sequelize, DataTypes);

/* ================= RELATIONS ================= */

// ----------------- Admin -> Member -----------------
Admin.hasMany(Member, { foreignKey: "id_admin", as: "members" });
Member.belongsTo(Admin, { foreignKey: "id_admin", as: "admin" });

// ----------------- Senior -> Leader -----------------
Member.hasMany(Member, {
  foreignKey: "id_senior",
  as: "leaders_bawahan",
});
Member.belongsTo(Member, {
  foreignKey: "id_senior",
  as: "senior",
});

// ----------------- Leader -> Member -----------------
Member.hasMany(Member, {
  foreignKey: "id_leader",
  as: "members_bawahan",
});
Member.belongsTo(Member, {
  foreignKey: "id_leader",
  as: "leader",
});

// ----------------- Properti -> Rumah -----------------
Properti.hasMany(Rumah, {
  foreignKey: "id_properti",
  as: "rumahs",
});
Rumah.belongsTo(Properti, {
  foreignKey: "id_properti",
  as: "properti",
});

// ----------------- Rumah -> Cabuy -----------------
Rumah.hasMany(Cabuy, {
  foreignKey: "id_rumah",
  as: "cabuys",
});
Cabuy.belongsTo(Rumah, {
  foreignKey: "id_rumah",
  as: "rumah",
});

// ----------------- Member -> Cabuy (AGENT HANDLE) -----------------
Member.hasMany(Cabuy, {
  foreignKey: "id_member",
  as: "cabuys",
});
Cabuy.belongsTo(Member, {
  foreignKey: "id_member",
  as: "agent",
});

// ----------------- CRM Relations -----------------
Member.hasMany(Crm, {
  foreignKey: "id_member",
  as: "crms",
});
Crm.belongsTo(Member, {
  foreignKey: "id_member",
  as: "member",
});

Cabuy.hasMany(Crm, {
  foreignKey: "id_cabuy",
  as: "crms",
});
Crm.belongsTo(Cabuy, {
  foreignKey: "id_cabuy",
  as: "cabuy",
});

// ===================================================
// =============== AGENT RELATIONS ===================
// ===================================================

// Rumah -> Agent
Rumah.hasOne(Agent, {
  foreignKey: "id_rumah",
  as: "agent",
});
Agent.belongsTo(Rumah, {
  foreignKey: "id_rumah",
  as: "rumah",
});

// Member -> Agent
Member.hasMany(Agent, {
  foreignKey: "id_member",
  as: "assigned_units",
});
Agent.belongsTo(Member, {
  foreignKey: "id_member",
  as: "member",
});

// ===================================================
// =============== SURVEY RELATIONS ==================
// ===================================================

Member.hasMany(Survey, {
  foreignKey: "id_member",
  as: "surveys",
});
Survey.belongsTo(Member, {
  foreignKey: "id_member",
  as: "member",
});

Cabuy.hasMany(Survey, {
  foreignKey: "id_cabuy",
  as: "surveys",
});
Survey.belongsTo(Cabuy, {
  foreignKey: "id_cabuy",
  as: "cabuy",
});

Rumah.hasMany(Survey, {
  foreignKey: "id_rumah",
  as: "surveys",
});
Survey.belongsTo(Rumah, {
  foreignKey: "id_rumah",
  as: "rumah",
});

/* ================= ASSOCIATE LOADER ================= */
const models = {
  Admin,
  Member,
  Cabuy,
  Properti,
  Rumah,
  Survey,
  Agent,
  Crm,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
