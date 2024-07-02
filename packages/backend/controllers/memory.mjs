/*
    This file exposes functions to work with rows of the Memory table in the database.
*/

import Memory from "../models/memory.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";

const callerName = "MemoryController";

/**
 * Create a new memory.
 * @param {Object} options - The memory's information.
 * @param {string} options.title - The memory's title.
 * @param {string} options.description - The memory's description.
 * @param {string} options.userName - The user's name.
 * @returns {Promise<Object>} The created memory.
 */
const createMemory = async ({ title, description, userName }) => {
    /*
    try {
        const memory = await Memory.create({
            title,
            description,
            userName,
        });

        return memory;
    } catch (error) {
        logger.error(callerName, "createMemory", error);
        throw error;
    }*/
   return true;
   }

/**
 * Get all memories.
 * @returns {Promise<Array<Object>>} All memories.
 */
const getMemories = async () => {
    try {
        const memories = await Memory.findAll();

        return memories;
    } catch (error) {
        logger.error(callerName, "getMemories", error);
        throw error;
    }
}

/**
 * Get a memory by ID.
 * @param {string} id - The memory's ID.
 * @returns {Promise<Object>} The memory.
 */
const getMemoryById = async (id) => {
    try {
        const memory = await Memory.findByPk(id);

        return memory;
    } catch (error) {
        logger.error(callerName, "getMemoryById", error);
        throw error;
    }
}

/**
 * Update a memory.
 * @param {string} id - The memory's ID.
 * @param {Object} options - The memory's information.
 * @param {string} options.title - The memory's title.
 * @param {string} options.description - The memory's description.
 * @returns {Promise<Object>} The updated memory.
 */
const updateMemory = async (id, { title, description }) => {
    try {
        const memory = await Memory.findByPk(id);

        if (!memory) {
            throw new Error("Memory not found.");
        }

        memory.title = title;
        memory.description = description;

        await memory.save();

        return memory;
    } catch (error) {
        logger.error(callerName, "updateMemory", error);
        throw error;
    }
}

/**
 * Delete a memory.
 * @param {string} id - The memory's ID.
 * @returns {Promise<void>}
 */
const deleteMemory = async (id) => {
    try {
        const memory = await Memory.findByPk(id);

        if (!memory) {
            throw new Error("Memory not found.");
        }

        await memory.destroy();
    } catch (error) {
        logger.error(callerName, "deleteMemory", error);
        throw error;
    }
}

export {
    createMemory,
    getMemories,
    getMemoryById,
    updateMemory,
    deleteMemory,
};
