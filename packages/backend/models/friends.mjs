import { DataTypes } from "sequelize";
import { db } from "../utils/database.mjs";
import User from "./user.mjs";

const Friend = db.define("Friend", {
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
    friendID: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    pending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }

});

Friend.belongsTo(User, { foreignKey: "userID" });
Friend.belongsTo(User, { foreignKey: "friendID" });

export default Friend;