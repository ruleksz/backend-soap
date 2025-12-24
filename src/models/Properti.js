const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lokasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    kontraktor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kontak_kontraktor: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "properti",
    timestamps: true,
  }
);

module.exports = Properti;