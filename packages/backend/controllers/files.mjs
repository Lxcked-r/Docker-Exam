/*
    This file exposes functions to work with rows of the Files table in the database.
*/

import File from "../models/files.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

const callerName = "FileController";

/**
 * Create a new file.
 * @param {Object} options - The file's information.
 * @param {string} options.name - The file's name.
 * @param {string} options.path - The file's path.
 * @param {number} options.size - The file's size.
 * @param {string} options.type - The file's type.
 * @param {string} options.userID - The user's id.
 * @param {string} options.channelID - The channel's id.
 * @returns {Promise<Object>} The created file.
 */
const createFile = async (options) => {
    // Validate the options
    if (!options.name || !options.path || !options.size || !options.type || !options.userID || !options.channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const file = await File.create({
            name: options.name,
            path: options.path,
            size: options.size,
            type: options.type,
            userID: options.userID,
            channelID: options.channelID,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, { transaction });

        logger.info(`Created file ${file.id}`, { caller: callerName });

        await transaction.commit();

        return file;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Get a file by its id.
 * @param {string} id - The file's id.
 * @returns {Promise<Object>} The file.
 */
const getFileById = async (id) => {
    // Validate the options
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const file = await File.findByPk(id);

        if (!file) {
            logger.error("File not found", { caller: callerName });
            return null;
        }

        return file;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

/**
 * Get all the files of a channel.
 * @param {string} channelID - The channel's id.
 * @returns {Promise<Array<Object>>} The files.
 */
const getFilesByChannelId = async (channelID) => {
    // Validate the options
    if (!channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const files = await File.findAll({
            where: {
                channelID
            }
        });

        return files;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

export {
    createFile,
    getFileById,
    getFilesByChannelId
};