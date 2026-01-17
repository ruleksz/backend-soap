const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Rumah = sequelize.define(
    "Rumah",
    {
        id_rumah: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tipe: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lb: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        lt: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        jml_kamar: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jml_lantai: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        harga: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },

        // 🔹 kolom baru
        unit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        terjual: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        image: {
            type: DataTypes.BLOB("long"),
            allowNull: true,
        },
        id_properti: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "properti",
                key: "id_properti",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

    },
    {
        tableName: "rumah",
        timestamps: false,
    }

);

module.exports = Rumah;
