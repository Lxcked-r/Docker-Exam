import { DataTypes } from "sequelize";
import { db } from "../utils/database.mjs";
import User from "./user.mjs";

const Channel = db.define("Channel", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    users: {
        type: DataTypes.STRING,
    },
    key: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    owner: {
        type: DataTypes.UUID,
        allowNull: false,
    },


});
Channel.belongsTo(User, { foreignKey: "owner" });
export default Channel;