
/*
    This file exposes functions to work with rows of the Channel table in the database.
*/

import Channel from "../models/channels.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

const callerName = "Channel";

/**
 * Create a new channel.
 * @param {Object} options - The channel's information.
 * @param {string} options.name - The channel's name.
 * @param {Array<string>} options.users - The users' ids. Default is an empty array.
 * @returns {Promise<Object>} The created channel.
 */
const createChannel = async (options) => {
    // Validate the options
    if (!options.name) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const channel = await Channel.create({
            name: options.name,
            users: options.users || []
        }, { transaction });

        logger.info(`Created channel ${channel.id}`, { caller: callerName });

        await transaction.commit();

        return channel;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Edit a channel.
 * @param {Object} options- The channel's information.
 * @param {string} options.id - The channel's id.
 * @param {string} options.name - The channel's name.
 * @param {Array<string>} options.users - The users' ids.
 * @returns {Promise<Object>} The edited channel.
 */
const editChannel = async (options) => {
    // Validate the options
    if (!options.id || !options.name || !options.users) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const channel = await Channel.update({
            name: options.name,
            users: options.users
        }, {
            where: {
                id: options.id
            },
            returning: true,
            plain: true
        }, { transaction });

        logger.info(`Edited channel ${channel.id}`, { caller: callerName });

        await transaction.commit();

        return channel;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

export {    
    createChannel,
    editChannel
};