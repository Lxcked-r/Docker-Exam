import { DataTypes } from "sequelize";
import { db } from "../utils/database.mjs";

const News = db.define("News", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default News;