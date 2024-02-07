/*
    This file exposes functions to work with rows of the TemplateRelations table in the database.
*/

import { db } from "../utils/database.mjs";
import TemplateRelations from "../models/templateRelation.mjs";
import logger from "../utils/logger.mjs";

const callerName = "TemplateRelationsController";

/**
 * Create a new template relation.
 * @param {Object} options - The template relation's information.
 * @param {string} options.userID - The template relation's user id
 * @param {string} options.templateID - The template relation's template id
 */
const createTemplatesRelation = async (options) => {
    // Validate the options
    if (
        !options.userID ||
        !options.templateID
    ) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const t = await db.transaction();
    try {
        const templateRelation = await TemplateRelations.create({
            userID: options.userID,
            templateID: options.templateID,
        }, { transaction: t });

        await t.commit();
        logger.info(`Created template relation ${templateRelation.id}`, { caller: callerName });
        return templateRelation;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to create template relation", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
}

export {
    createTemplatesRelation,
};