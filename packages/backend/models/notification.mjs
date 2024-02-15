import { DataTypes } from 'sequelize';
import { db } from '../utils/database.mjs';
import User from './user.mjs';
import Message from './messages.mjs';

const Notification = db.define('Notification', {
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
    }
});

Notification.belongsTo(User, { foreignKey: 'userID' });
Notification.belongsTo(Message, { foreignKey: 'messageID' });

export default Notification;