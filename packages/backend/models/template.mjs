import { DataTypes } from 'sequelize';
import { db } from "../utils/database.mjs";

const Template = db.define('Template', { // describes a task that should be created on a schedule. can be assigned to many users
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
	body: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	schedule: { // rschedule json string
		type: DataTypes.STRING,
		allowNull: false,
	},
	maxAge: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},

	enabled: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: false,
	},
});

export default Template;