/*
 This file exposes functions to work with rows of the News table in the database.
*/

import News from "../models/news.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

const callerName = "NewsController";

/**
 * Create a new news article.
 * @param {Object} options - The news article's information.
 * @param {string} options.title - The news article's title.
 * @param {string} options.body - The news article's body.
 * @returns {Promise<Object>} The created news article.
 */
const createNews = async (options) => {
    // Validate the options
    if (!options.title || !options.body) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const news = await News.create({
            title: options.title,
            body: options.body,
        }, { transaction });

        logger.info(`Created news article ${news.id}`, { caller: callerName });

        await transaction.commit();

        return news;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Get last new.
 * @returns {Promise<Object>} The last news article.
 */
const getLastNews = async () => {
    let news;
    try {
        const
            news = await News.findOne({
                order: [
                    ['createdAt', 'DESC']
                ]
            });
            return news;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

export {
    createNews,
    getLastNews
};