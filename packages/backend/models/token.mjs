import { DataTypes } from "sequelize";
import { db } from "../utils/database.mjs";

const Token = db.define('Token', { // auth token for a user. revoked tokens are removed on a cycle
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		unique: true,
		allowNull: false,
	},
	token: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
	},
	userId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	revoked: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
});

export default Token;