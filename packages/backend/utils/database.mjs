/*
    This file exposes a Sequelize instance that can be used to interact with the database.
    It also sets up a connection to the database and closes it when the app terminates.
*/

import { Sequelize } from "sequelize";
import logger from "./logger.mjs";
import config from "../config.json" assert { type: "json" };

const dbConfig = {
  host: process.env.DB_HOST || config.db.host,
  port: process.env.DB_PORT || config.db.port,
  database: process.env.DB_NAME || config.db.database,
  username: process.env.DB_USER || config.db.user,
  password: process.env.DB_PASSWORD || config.db.password,
  dialect: 'mysql',
};

// Ensure that the config file is correctly imported and contains the necessary database configuration
const db = new Sequelize(
  config.db.database,      // database name
  config.db.user,      // username
  config.db.password,  // password
  {
    host: process.env.DB_HOST || config.db.host,
    port: process.env.DB_PORT || config.db.port,
    dialect: 'mysql',
    define: {
      freezeTableName: true,
    },
  }
);

/**
 * Connect to the database.
 * @returns {Promise<boolean>} true if the connection was successful, false otherwise
 */
const connect = async () => {
    try {
        logger.info("Connecting to the database...");
        await db.authenticate();
        logger.info("Connected to the database.");
        return true;
    } catch (error) {
        logger.error("Failed to connect to the database", { error });
        return false;
    }
};

/**
 * Sync the models with the database. This should be called when the app starts.
 * @returns {Promise<boolean>} true if the sync was successful, false otherwise
 */
const syncModels = async () => {
    try {
        await db.sync();
        logger.info("Synced models with the database");
        return true;
    } catch (error) {
        console.log(error);
        logger.error("Failed to sync models with the database", { error });
        return false;
    }
};

/**
 * Disconnect from the database. This should be called when the app terminates.
 * @returns {Promise<void>}
 */
const disconnect = async () => {
    try {
        await db.close();
        logger.info("Disconnected from the database");
    } catch (error) {
        logger.error("Failed to disconnect from the database", { error });
    }
};

// handle signals to terminate the app
process.on("SIGINT", disconnect);
process.on("SIGTERM", disconnect);

export { 
    db, 
    connect,
    syncModels,
    disconnect
}