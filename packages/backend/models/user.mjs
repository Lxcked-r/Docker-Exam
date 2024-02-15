import { DataTypes } from 'sequelize';
import { db } from "../utils/database.mjs";

const User = db.define('User', { 
	// describes a user. operators may create and edit templates. users can mark tasks they own as complete
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		unique: true,
		allowNull: false,
	},
	username: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	operator: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
	avatar: {
		type: DataTypes.STRING,
		allowNull: true,
	},
});

export default User;