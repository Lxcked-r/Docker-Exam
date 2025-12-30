/*
    This file exposes functions to work with rows of the ChannelsRelations table in the database.
*/

import ChannelsRelations from "../models/channelsRelation.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

import User from "../models/user.mjs";
import Channel from "../models/channels.mjs";

const callerName = "ChannelsRelations";

/**
 * Create a new channel relation.
 * @param {Object} options - The channel's information.
 * @param {string} options.userID - The user's id.
 * @param {string} options.channelID - The channel's id.
 * @returns {Promise<Object>} The created channel relation.
 */
const createChannelRelation = async (options) => {
    // Validate the options
    if (!options.userID || !options.channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const channelRelation = await ChannelsRelations.create({
            userID: options.userID,
            channelID: options.channelID,
        }, { transaction });

        logger.info(`Created channel relation ${channelRelation.id}`, { caller: callerName });

        await transaction.commit();

        return channelRelation;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Create a new channel relation by username and channel id.
 * @param {Object} options - The channel's information.
 * @param {string} options.username - The user's username.
 * @param {string} options.channelID - The channel's id.
 * @returns {Promise<Object>} The created channel relation.
 */
const createChannelRelationByUsername = async (options) => {
    // Validate the options
    if (!options.username || !options.channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const user = await User.findOne({
            where: {
                username: options.username
            }
        });

        if (!user) {
            logger.error("User not found", { caller: callerName });
            return null;
        }

        const channelRelation = await ChannelsRelations.create({
            userID: user.id,
            channelID: options.channelID,
        }, { transaction });

        logger.info(`Created channel relation ${channelRelation.id}`, { caller: callerName });

        await transaction.commit();

        return channelRelation;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Delete a channel relation.
 * @param {Object} options - The channel's information.
 * @param {string} options.userID - The user's id.
 * @param {string} options.channelID - The channel's id.
 * @returns {Promise<Object>} The deleted channel relation.
 */
const deleteChannelRelation = async (options) => {
    // Validate the options
    if (!options.userID || !options.channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const channelRelation = await ChannelsRelations.findOne({
            where: {
                userID: options.userID,
                channelID: options.channelID,
            }
        });

        if (!channelRelation) {
            logger.error("Channel relation not found", { caller: callerName });
            return null;
        }

        await channelRelation.destroy({ transaction });

        logger.info(`Deleted channel relation ${channelRelation.id}`, { caller: callerName });

        await transaction.commit();

        return channelRelation;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Get all channels relations of a user.
 * @param {string} userID - The user's id.
 * @returns {Array<Object>} The channels relations.
 */
const getChannelsRelations = async (userID) => {
    // Validate the options
    if (!userID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const channelsRelations = await ChannelsRelations.findAll({
            include: [
            {
                model: Channel,
                attributes: ["name", "avatar", "id", "type"],
            },
            {
                model: User,
                attributes: ["username", "avatar", "id"],
            }],
            where: {
                userID: userID
            }
        });

        return channelsRelations;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

/**
 * Get all channels relations of a channel.
 * @param {string} channelID - The channel's id.
 * @returns {Promise<Array>} The channels relations.
 */
const getChannelsRelationsByChannel = async (channelID) => {
    // Validate the options
    if (!channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const channelsRelations = await ChannelsRelations.findAll({
            include: [
            {
                model: User,
                attributes: ["username", "avatar", "id"],
            }],
            where: {
                channelID: channelID
            }
        });

        return channelsRelations;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

export {
    createChannelRelation,
    deleteChannelRelation,
    getChannelsRelations,
    getChannelsRelationsByChannel,
    createChannelRelationByUsername
}