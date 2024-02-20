import { DataTypes } from "sequelize";
import { db } from "../utils/database.mjs";
import User from "./user.mjs";
import Channel from "./channels.mjs";

const ChannelsRelations = db.define("ChannelsRelations", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
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
    channOP : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
});

ChannelsRelations.belongsTo(User, { foreignKey: "userID" });
ChannelsRelations.belongsTo(Channel, { foreignKey: "channelID" });

export default ChannelsRelations;