module.exports = (sequelize, DataTypes) => {
    const Crm = sequelize.define(
        "Crm",
        {
            id_crm: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            id_member: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            id_cabuy: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            hasil_survey: {
                type: DataTypes.ENUM("tertarik", "ragu", "tidak tertarik"),
                allowNull: false,
            },
            catatan: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            gambar: {
                type: DataTypes.BLOB("long"),
                allowNull: true,
            },
            strategi_followup: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            interaksi_terakhir: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            status_validasi: {
                type: DataTypes.ENUM("Menunggu", "Disetujui", "Ditolak"),
                defaultValue: "Menunggu",
            },
            catatan_validasi: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

        },
        {
            tableName: "crm",
            timestamps: false,
        }
    );

    return Crm;
};
