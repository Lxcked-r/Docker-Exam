/*
    This file exposes a Sequelize instance that can be used to interact with the database.
    It also sets up a connection to the database and closes it when the app terminates.
*/

import { Sequelize } from "sequelize";
import logger from "./logger.mjs";

const db = new Sequelize({
    dialect: "sqlite",
    storage: "./db.sqlite",
    logging: false,
    define: {
        freezeTableName: true,
    },	
});


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
        await db.sync( );
        logger.info("Synced models with the database");
        return true;
    } catch (error) {
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