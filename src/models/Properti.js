const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Member = require("./Member");

const Properti = sequelize.define(
  "Properti",
  {
    id_properti: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_properti: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lokasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kontraktor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kontak_kontraktor: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    id_member: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Member,
        key: "id_member",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "properti",
    timestamps: true,
  }
);

module.exports = Properti;