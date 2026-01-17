const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Agent = sequelize.define(
    "Agent",
    {
        id_agent: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_rumah: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "rumah",
                key: "id_rumah",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        id_member: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "member",
                key: "id_member",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "agent",
        timestamps: false,
    }
);

module.exports = Agent;
