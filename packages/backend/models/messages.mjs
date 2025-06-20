import { DataTypes } from "sequelize";
import { db } from "../utils/database.mjs";
import User from "./user.mjs";

const Message = db.define("Message", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userID: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    channelID: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "text",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },

    editedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },


});

Message.belongsTo(User, { foreignKey: "userID" });

Message.sync({ alter: true});

export default Message;