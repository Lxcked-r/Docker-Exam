
/*
    This file exposes functions to work with rows of the Channel table in the database.
*/

import Channel from "../models/channels.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

const callerName = "ChannelController";


/**
 * Create a new channel.
 * @param {Object} options - The channel's information.
 * @param {string} options.name - The channel's name.
 * @param {String} options.owner - The owner's ids. Default is null.
 * @param {String} [options.id=randomUUID] - The channel's id. Default is a random UUID.
 * @param {String} [options.type=public] - The channel's type. Default is public.
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
            key: options.key || "",
            owner: options.owner,
            id: options.id || undefined,
            type: options.type || "public",
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

/**
 * Get a channel by User ID.
 * @param {string} id - The user's id.
 * @return {Array<Object>} The channels.
 */
const getChannelById = async (id) => {
    // Validate the options
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const channel = await Channel.findByPk(id);

        return channel;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}


export {    
    createChannel,
    editChannel,
    getChannelById
};