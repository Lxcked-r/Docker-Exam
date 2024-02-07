/*
    This file exposes functions to work with rows of the Template table in the database.
*/

import { db } from "../utils/database.mjs";
import Template from "../models/template.mjs";
import logger from "../utils/logger.mjs";
const callerName = "TemplateController";

/**
 * Create a new template.
 * @param {Object} options - The template's information.
 * @param {string} options.name - The template's name.
 * @param {string} options.body - The template's description.
 * @param {string} options.schedule - The template's stringified rschedule config data.
 * @param {bigint} options.maxAge - The template's max age in milliseconds before the task is considered overdue.
 * @param {boolean} [options.enabled=true] - The template's enabled status.
 * @returns {Promise<Object>} The created template.
 */
const createTemplate = async (options) => {
    if(!options.name || !options.body || !options.schedule || !options.maxAge) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const t = await db.transaction();

    try {
        const template = await Template.create({
            name: options.name,
            body: options.body,
            schedule: options.schedule,
            maxAge: options.maxAge,
            enabled: options.enabled ?? true,
        }, { transaction: t });

        await t.commit();

        return template;
    } catch(err) {
        await t.rollback();
        logger.error("Failed to create template", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
};

/**
* Delete the template.
* @param {Object} options - The template's information.
* @param {string} options.id - The template's id.
* @returns {Promise<Object>} The created template.
*/
const deleteTemplate = async (options) => {
    if(!options.id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const t = await db.transaction();
    
    try {
        const template = await Template.destroy({
            where: {
                id: options.id,
            },
        }, { transaction: t });
        
        await t.commit();
        return template;
    } catch(err) {
        await t.rollback();
        logger.error("Failed to delete template", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
};

/**
 * update the template.
 * @param {Object} options - The template's information.
 * @param {string} options.id - The template's id.
 * @param {string} options.name - The template's name.
 * @param {string} options.body - The template's description.
 * @param {string} options.schedule - The template's stringified rschedule config data.
 * @param {bigint} options.maxAge - The template's max age in milliseconds before the task is considered overdue.
 * @param {boolean} [options.enabled=true] - The template's enabled status.
 */
const updateTemplate = async (options) => {
    if (!options.id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const response = await getTemplates(options.id);
    if (!response) {
        logger.error("Template does not exist", { caller: callerName });
        return null;
    }

    const t = await db.transaction();

    try {
        const updatedTemplate = await Template.update({
            name: options.name ?? response.name,
            body: options.body ?? response.body,
            schedule: options.schedule ?? response.schedule,
            maxAge: options.maxAge ?? response.maxAge,
            enabled: options.enabled ?? response.enabled,
        }, {
            where: {
                id: options.id,
            },
        }, { transaction: t });

        await t.commit();
        logger.info(`Updated template ${updatedTemplate.id}`, { caller: callerName });
        return updatedTemplate;
    } catch(err) {
        await t.rollback();
        logger.error("Failed to update template", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
}


/**
 * Get the template by id.
 * @param {string} id - The template's ID.
 * @returns {Promise<Object>} The template.
 */
const getTemplates = async (id) => {
    if (!id) {
        try {
            const templates = await Template.findAll();
            const newObject = {};
            //foreach objects inside of the templates array
            for (const template of templates) {
                //create a new object with the id of the template
                newObject[template.id] = template;
            }
            return newObject;
        } catch (err) {
            logger.error("Failed to get templates", { caller: callerName });
            logger.error(err, { caller: callerName });
            return null;
        }
    } else {
        try {
            const template = await Template.findByPk(id);
            logger.info(`Retrieved template ${template.id}`, { caller: callerName });
            return template;
        } catch (err) {
            logger.error("Failed to get template", { caller: callerName });
            logger.error(err, { caller: callerName });
            return null;
        }
    }
}

export {
    createTemplate,
    deleteTemplate,
    updateTemplate,
    getTemplates,
};
