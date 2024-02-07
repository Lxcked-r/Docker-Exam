import { DataTypes } from 'sequelize';
import { db } from "../utils/database.mjs";

const TemplateRelation = db.define('TemplateRelation', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		unique: true,
		allowNull: false,
	},

	/*
		This links a user to a template, determining whether they can see / act on it or not.
	*/

	templateId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	userId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
});

export default TemplateRelation;