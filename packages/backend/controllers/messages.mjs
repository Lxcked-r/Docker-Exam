/*
    This file exposes functions to work with rows of the Message table in the database.
*/

import Message from "../models/message.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

const callerName = "Message";

/**
 * Create a new message.
 * @param {Object} options - The message's information.
 * @param {string} options.text - The message's text.
 * @param {string} options.userId - The user's id.
 * @returns {Promise<Object>} The created message.
 */
const createMessage = async (options) => {
    // Validate the options
    if (!options.text || !options.userId) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const message = await Message.create({
            text: options.text,
            userId: options.userId,
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
 * Get all messages between 2 users.
 * @param {string} userId - The user's id.
 * @param {string} destinationUserId - The destination user's id.
 * @returns {Promise<Array<Object>>} All messages.
 */
const getMessages = async (userId, destinationUserId) => {
    // Validate the options
    if (!userId || !destinationUserId) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const messages = await Message.findAll({
            where: {
                userId,
                destinationUserId,
            },
        });

        return messages;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}