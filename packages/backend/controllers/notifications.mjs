/*
    This file exposes functions to work with rows of the Notification table in the database.
*/

import Notification from "../models/notification.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

const callerName = "Notification";

/**
 * Create a new notification.
 * @param {Object} options - The notification's information.
 * @param {string} options.userID - The user's id.
 * @param {string} options.messageID - The message's id.
 * @returns {Promise<Object>} The created notification.
 */
const createNotification = async (options) => {
    // Validate the options
    if (!options.userID || !options.messageID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const notification = await Notification.create({
            userID: options.userID,
            messageID: options.messageID,
        }, { transaction });

        logger.info(`Created notification ${notification.id}`, { caller: callerName });

        await transaction.commit();

        return notification;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Get pagination of notifications from user.
 * @param {string} userID - The destination user's id.
 * @returns {Promise<Array<Object>>} All notifications.
 */
const getNotifications = async (userID) => {
    // Validate the options
    if (!userID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const notifications = await Notification.findAll({
        where: { userID },
        order: [["createdAt", "DESC"]],
    });

    return notifications;
}

export {
    createNotification,
    getNotifications,
};
