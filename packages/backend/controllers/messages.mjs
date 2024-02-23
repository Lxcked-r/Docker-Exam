/*
    This file exposes functions to work with rows of the Message table in the database.
*/

import Message from "../models/messages.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

import User from "../models/user.mjs";

const callerName = "Message";

/**
 * Create a new message.
 * @param {Object} options - The message's information.
 * @param {string} options.text - The message's text.
 * @param {string} options.channelID - The channel's id.
 * @param {string} options.userID - The user's id.
 * @returns {Promise<Object>} The created message.
 */
const createMessage = async (options) => {
    // Validate the options
    if (!options.text || !options.userID || !options.channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const message = await Message.create({
            text: options.text,
            userID: options.userID,
            channelID: options.channelID,
        }, { transaction });

        logger.info(`Created message ${message.id}`, { caller: callerName });

        await transaction.commit();

        return message;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Get pagination of messages from channel.
 * @param {string} channelID - The destination user's id.
 * @returns {Promise<Array<Object>>} All messages.
 */
const getMessages = async (channelID) => {
    // Validate the options
    if (!channelID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const messages = await Message.findAll({
            include: [{
                model: User,
                attributes: ["username", "avatar"],
            
            }],
            where: {
                channelID,
            },
        });

        return messages;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

/**
 * Get Message by ID.
 * @param {string} messageID - The message's id.
 * @returns {Promise<Object>} The message.
 */
const getMessageByID = async (messageID) => {
    // Validate the options
    if (!messageID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const message = await Message.findOne({
            include: [
                {
                    model: User,
                    attributes: ["username", "avatar"],
                },
            ],
            where: {
                id: messageID,
            },});

        return message;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

export {
    createMessage,
    getMessages,
    getMessageByID,
};