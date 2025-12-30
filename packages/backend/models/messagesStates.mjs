import { DataTypes } from "sequelize";
import { db } from '../utils/database.mjs';
import User from './user.mjs';
import Message from './messages.mjs';

const messageState = db.define('MessageState', {
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
    messageID: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM('read', 'unread', 'deleted'),
        allowNull: false,
        defaultValue: 'unread',
    },
});

messageState.belongsTo(User, { foreignKey: 'userID' });
messageState.belongsTo(Message, { foreignKey: 'messageID' });

export default messageState;