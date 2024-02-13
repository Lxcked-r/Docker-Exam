import { DataTypes } from "sequelize";
import { db } from "../utils/database.mjs";

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


});

export default Channel;