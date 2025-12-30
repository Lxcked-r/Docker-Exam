/*
    This file exposes functions to work with rows of the Message table in the database.
*/

import Message from "../models/messages.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

import { encrypt } from "../utils/crypter.js";

import User from "../models/user.mjs";

import fs from "fs";

const callerName = "Message";

const paginate = (query, { page, pageSize }) => {
    const offset = page * pageSize;
    const limit = pageSize;
  
    return {
      ...query,
      offset,
      limit,
    };
  };
  

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
    
    // check if message text is empty or made of only spaces
    if (typeof options.text !== "string") {
        logger.error("Message text must be a string", { caller: callerName });
        return null;
    }
    // check if message text is empty or made of only spaces
    if (options.text.trim() === "") {
        logger.error("Message text cannot be empty", { caller: callerName });
        return null;
    }
    

    const createdAt = new Date();
    const updatedAt = createdAt;

    const transaction = await db.transaction();

    try {
        const message = await Message.create({
            text: options.text,
            userID: options.userID,
            channelID: options.channelID,
            type: options.type || "text",
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
 * @param {number} page - The page number.
 * @returns {Promise<Array<Object>>} All messages.
 */
const getMessages = async (channelID, page) => {
    let offset=null;
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
            offset: page>1?(page-1)*35:0,
            limit: 35,
            order: [["createdAt", "DESC"]],
        });
        return JSON.stringify(await encrypt(messages));
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
                    attributes: ["username", "avatar", "id"],
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

/**
 * Delete a message.
 * @param {string} id - The message's id.
 * @returns {Promise<Object>} The deleted message.
 */
const deleteMessage = async (id) => {
    // Validate the options
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const message = await Message.destroy({
            where: {
                id
            }
        }, { transaction });

        logger.info(`Deleted message ${id}`, { caller: callerName });

        await transaction.commit();

        return message;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}


/**
 * Edit a message.
 * @param {string} id - The message's id.
 * @param {string} text - The message's text.
 * @returns {Promise<Object>} The edited message.
 */
const editMessage = async (id, text) => {

    logger.info(`Editing message ${id}`, { caller: callerName });
    // Validate the options
    if (!id || !text) {
        logger.error("Missing required field on controller", { caller: callerName });
        return null;
    }

    const editedAt = new Date();

    const transaction = await db.transaction();

    try {
        const message = await Message.update({
            text,
            editedAt
        }, {
            where: {
                id
            }
        }, { transaction });

        logger.info(`Edited message ${id}`, { caller: callerName });





        await transaction.commit();

        return message;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

export {
    createMessage,
    getMessages,
    getMessageByID,
    deleteMessage,
    editMessage,
};