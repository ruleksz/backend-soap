const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
// Hapus import Member di sini untuk menghindari circular dependency
// Relasi sudah diatur di models/index.js

const Cabuy = sequelize.define(
    "Cabuy",
    {
        id_cabuy: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nama_cabuy: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        kontak: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            // Update ENUM sesuai kebutuhan fitur "Siap Survey"
            type: DataTypes.ENUM("Baru", "Follow Up", "Siap Survey", "Booking", "Closing", "Lost"),
            defaultValue: "Baru",
            allowNull: true,
        },
        tanggal_follow_up: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggal_masuk: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW, // Otomatis isi tanggal saat input
        },
        id_member: {
            type: DataTypes.INTEGER,
            allowNull: true,
            // References ini opsional di level model jika sudah ada di migration/index.js
            // Tapi bagus untuk dokumentasi kode
        },
    },
    {
        // 🔥 PERBAIKAN UTAMA: Sesuaikan dengan nama tabel di database asli Anda
        tableName: "cabuy", 
        timestamps: false, 
    }
);

// Hapus baris Member.hasMany(...) dari sini.
// Biarkan relasi diatur oleh models/index.js agar rapi.

module.exports = Cabuy;