import { DataTypes } from "sequelize";

import { db } from '../utils/database.mjs';
import User from './user.mjs';
import Channel from './channels.mjs';

const File = db.define('File', {

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
    path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
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
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

File.belongsTo(User, { foreignKey: 'userID' });
File.belongsTo(Channel, { foreignKey: 'channelID' });

export default File;