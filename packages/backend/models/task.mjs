import { DataTypes } from 'sequelize';
import { db } from "../utils/database.mjs";

const Task = db.define('Task', { // a template instance. created based on its template's schedule
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		unique: true,
		allowNull: false,
	},

	complete: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
	completedAt: {
		type: DataTypes.DATE,
		allowNull: true,
	},

	templateId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
});

export default Task;