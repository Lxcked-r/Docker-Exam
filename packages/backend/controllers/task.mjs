/*
    This file exposes functions to work with rows of the Task table in the database.
*/
import { db } from "../utils/database.mjs";
import Task from "../models/task.mjs";
import logger from "../utils/logger.mjs";

const callerName = "TaskController";

/**
 * Create a new task.
 * @param {Object} options - The task's information.
 * @param {string} options.id - The task's id
 * @param {string} options.templateId - The task's template id
 * @param {boolean} options.complete - The task's completion status
 * @returns {Promise<Object>} The created task.
 */
const createTask = async (options) => {
    // Validate the options
    if (
        !options.templateId || 
        options.complete === undefined
    ) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const t = await db.transaction();

    try {
        const task = await Task.create({
            templateId: options.templateId,
            complete: options.complete,
            completedAt: null,
        }, { transaction: t });
        await t.commit();
        return task;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to create task", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
};

/**
 * Delete the task.
 * @param {Object} options - The task's information.
 * @param {string} options.id - The task's id
 * @param {string} options.templateId - The task's template id
 * @returns {Promise<Object>} The created task.
 */
const deleteTask = async (options) => {
    // Validate the options
    if (
        !options.id
    ) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const result = await getTaskByID(options.id);
    
    if(!result){
        logger.error("Task does not exist", { caller: callerName });
        return null;
    }

    const t = await db.transaction();

    try {
        const task = await Task.destroy({
            where: {
                id: options.id,
            },
        }, { transaction: t });
        await t.commit();
        logger.info(`Deleted task ${deletedTask.id}`, { caller: callerName });
        return task;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to delete task", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
};

/**
 * Update the task's parameters.
 * @param {Object} options - The task's information.
 * @param {string} options.id - The task's id
 * @param {string} options.templateId - The task's template id
 * @param {boolean} options.complete - The task's completion status
 * @returns {Promise<Object>} The created task.
 */
const updateTask = async (options) => {
    // Validate the options
    if (
        !options.id || 
        options.complete === undefined
    ) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const result = await getTasks(options.id);
    
    if(!result){
        logger.error("Task does not exist", { caller: callerName });
        return null;
    }

    if (options.complete === true) {
        options.completedAt = new Date();
    } else {
        options.completedAt = result.completedAt;
    }

    const t = await db.transaction();

    try {
        const task = await Task.update({
            templateId: options.templateId,
            complete: options.complete,
            completedAt: options.completedAt,
        }, {
            where: {
                id: options.id,
            },
        }, { transaction: t });
        await t.commit();
        logger.info(`Updated task ${options.id}`, { caller: callerName });
        return task;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to update task", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
}

/**
 * Get a task object by its ID.
 * @param {string} id - The task's id
 * @returns {Promise<Object>} The found task.
 */
const getTasks = async (id) => {
    // Validate the options
    if (!id) {
        try {
            const tasks = await Task.findAll();
            logger.info(`Retrieved tasks`, { caller: callerName });
            return tasks;
        } catch (err) {
            logger.error("Failed to get tasks", { caller: callerName });
            return null;
        }
    } else {
        try {
            const task = await Task.findByPk(id);
            logger.info(`Retrieved task ${task.id}`, { caller: callerName });
            return task;
        } catch (err) {
            logger.error("Failed to get task", { caller: callerName });
            return null;
        }
    }
}


export {
    createTask,
    deleteTask,
    updateTask,
    getTasks,
};