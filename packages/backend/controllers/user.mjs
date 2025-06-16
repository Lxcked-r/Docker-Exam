/*
    This file exposes functions to work with rows of the User table in the database.
*/



import User from "../models/user.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";
import bcrypt from "bcrypt";

import fs from "fs";

import { SMTPClient } from "emailjs";

const client = new SMTPClient({
    host: "smtp.freesmtpservers.com",
    port: 25,
    
});

const callerName = "User";

/**
 * Hash a password.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} The hashed password.
 * @private
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

/**
 * Create a new user.
 * @param {Object} options - The user's information.
 * @param {string} options.name - The user's name.
 * @param {string} options.username - The user's username.
 * @param {string} options.password - The user's password.
 * @param {boolean} options.operator - Whether the user is an operator.
 * @returns {Promise<Object>} The created user.
 */
const createUser = async (options) => {
    // Validate the options
    if (
        !options.name ||
        !options.username ||
        !options.password ||
        options.operator === undefined
    ) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    // Check if the username already exists
    const existingUser = await User.findOne({
        where: {
            username: options.username,
        },
    });
    if (existingUser) {
        logger.error("Username already exists", { caller: callerName });
        return null;
    }
    // Check if the email already exists
    const existingEmail = await User.findOne({
        where: {
            email: options.email,
        },
    });
    if (existingEmail) {
        logger.error("Email already exists", { caller: callerName });
        return null;
    }

    // Check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(options.email)) {
        logger.error("Invalid email format", { caller: callerName });
        return null;
    }

    // write usename in lowercase
    options.username = options.username.toLowerCase();
    

    // Hash the password
    const hashedPassword = await hashPassword(options.password);

    const transaction = await db.transaction();

    try {

        const user = await User.create({
            email: options.email,
            name: options.name,
            username: options.username,
            password: hashedPassword,
            operator: options.operator,
            schedule: null,
            avatar: null,
        }, { transaction });

        logger.info(`Created user ${user.id}`, { caller: callerName });

        await transaction.commit();

        client.send({
            text: "Welcome to Bowy!",
            from: "you <username@your-email.com>",
            to: `someone ${options.email}`,
            subject: "Welcome!",
        }, (err, message) => {
            if (err) {
                console.log(err);
            } else {
                console.log(message);
            }
        })
        fs.copyFileSync("./avatars/default.png", `./avatars/${user.id}.png`);
        updateAvatar(user.id, `./avatars/${user.id}.png`);
        return user;
    } catch (err) {
        await transaction.rollback();
        logger.error("Failed to create user", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
};

/**
 * Get a user by their UUID.
 * @param {string} uuid - The user's UUID.
 * @returns {Promise<Object>} The user.
 */
const getUserByUUID = async (uuid) => {
    const user = await User.findByPk(uuid);

    if (!user) {
        logger.error("Failed to get user by UUID", { caller: callerName });
        return null;
    }

    return user;
};

/**
 * Get a user by their username.
 * @param {string} username - The user's username.
 * @returns {Promise<Object>} The user.
 */
const getUserByUsername = async (username) => {
    const user = await User.findOne({
        where: {
            username,
        },
    });

    if (!user) {
        logger.error("Failed to get user by username", { caller: callerName });
        return null;
    }
    return user;
};

/**
 * Check a password against the one stored in the database.
 * @param {string} username - The user's username.
 * @param {string} password - The password to check.
 * @returns {Promise<boolean>} Whether the password is valid.
 */
const validatePasswordByUsername = async (username, password) => {
    // Check if the supplied password is the same as the one stored in the DB
    const user = await getUserByUsername(username);
    if (!user) {
        logger.error("User not found", { caller: callerName });
        return false;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    return validPassword;
}

/**
 * Check a password against the one stored in the database.
 * @param {string} uuid - The user's UUID.
 * @param {string} password - The password to check.
 * @returns {Promise<boolean>} Whether the password is valid.
 */
const validatePasswordByUUID = async (uuid, password) => {
    // Check if the supplied password is the same as the one stored in the DB
    const user = await getUserByUUID(uuid);
    if (!user) {
        logger.error("User not found", { caller: callerName });
        return false;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    return validPassword;
}

/**
 * Update a user.
 * @param {string} uuid - The user's UUID.
 * @param {Object} options - The user's information.
 * @param {string} options.name - The user's name.
 * @param {string} options.username - The user's username.
 * @param {string} options.password - The user's password.
 * @param {boolean} options.operator - Whether the user is an operator.
 * @returns {Promise<Object>} The updated user.
 */
const updateUser = async (uuid, options) => {
    const newOptions = {};

    if (options.name !== undefined) {
        newOptions.name = options.name;
    }

    if (options.username !== undefined) {
        newOptions.username = options.username;
    }

    if (options.password !== undefined) {
        newOptions.password = await hashPassword(options.password);
    }

    if (options.operator !== undefined) {
        newOptions.operator = options.operator;
    }

    const user = await User.findByPk(uuid);

    if (!user) {
        logger.error("User not found", { caller: callerName });
        return null;
    }

    const t = await db.transaction();

    try {
        const updatedUser = await user.update(newOptions, { transaction: t });
        await t.commit();
        return updatedUser;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to update user", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
}

/**
 * Update a user's avatar.
 * @param {string} uuid - The user's UUID.
 * @param {string} path - The path to the avatar.
 * @returns {Promise<Object>} The updated user.
 */
const updateAvatar = async (uuid, path) => {
    const user = await User.findByPk(uuid);

    if (!user) {
        logger.error("User not found", { caller: callerName });
        return null;
    }

    const t = await db.transaction();

    try {
        const updatedUser = await user.update({ avatar: path }, { transaction: t });
        await t.commit();
        return updatedUser;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to update user", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
}

/**
 * Returns a safe to send array of all users.
 * @returns {Promise<Object[]>} The array of users.
 */
const getAllUsers = async () => {
    const users = await User.findAll();

    if (!users) {
        logger.error("Failed to get all users", { caller: callerName });
        return null;
    }

    // assemble an array of jsons and return that instead

    const array = [];

    users.forEach(user => {
        array.push({
            name: user.name,
            username: user.username,
            operator: user.operator,
            id: user.id,
            avatar: user.avatar,
        });
    });

    return array;
}

const deleteUser = async (uuid) => {
    const user = await User.findByPk(uuid);

    if (!user) {
        logger.error("User not found", { caller: callerName });
        return null;
    }

    const t = await db.transaction();

    // TODO: delete all of the user's data as the relevant methods are implemented
    // currently, this only deletes the user's row in the database

    try {
        await user.destroy({ transaction: t });
        await t.commit();
        return true;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to delete user", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
}

/**
 * Upload avatar image
 * @param {Object} options - The user's information.
 * @param {string} options.id - The user's UUID.
 * @param {string} options.files - The user's image.
 * @returns {Promise<Object>} The updated user.
 */
const uploadAvatar = async (options) => {
    if(!options.files || Object.keys(req.files).length === 0) {
        res.status(400).json({ success: false, message: "Missing File" });
        return;
    }

    const userUUID = req.params.id;
    const file = req.files.image;

    // return if the user is trying to change someone else's avatar
    if (req.user.id !== userUUID) {
        res.status(403).json({ success: false, message: "You cannot change someone else's avatar" });
        return;
    }

    try {
        await lstat(`./avatars/${userUUID}.png`);
        await rm(`./avatars/${userUUID}.png`, { recursive: true });
    } catch (err) { 
        // this is fine because it means the file doesn't exist. lstat throws an error if the file doesn't exist
    }

    await file.mv(`./avatars/${userUUID}.png`, async (err) => {
        if(err) {
            console.log(err);
            console.log(path.parse(`./avatars/${userUUID}.png`));
            res.status(400).json({ success: false, message: "Failed to upload file" });
            return;
        }
        await updateAvatar(userUUID, `./avatars/${userUUID}.png`);
        res.status(200).json({ success: true, message: "avatar changed" });
    });
}

/**
 * Reset user's password
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @returns {Promise<Object>} The updated user.
 */
const resetPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({
        where: {
            email
        }
    });

    if (!user) {
        res.status(400).json({ success: false, message: "User not found" });
        return;
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(newPassword);

    const t = await db.transaction();

    try {
        await user.update({ password: hashedPassword }, { transaction: t });
        await t.commit();
        res.status(200).json({ success: true, message: "Password reset" });
    } catch (err) {
        await t.rollback();
        res.status(400).json({ success: false, message: "Failed to reset password" });
    }
}

const forgotPassword = async (req, res) => {
    // send email with reset link
    return res.status(200).json({ success: true, message: "Email sent" });
    // placeholder for now new code write here in console
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(newPassword);

    const t = await db.transaction();

    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    });

    if (!user) {
        res.status(400).json({ success: false, message: "User not found" });
        return;
    }

    try {
        await user.update({ password: hashedPassword }, { transaction: t });
        await t.commit();
        res.status(200).json({ success: true, message: "Password reset " + newPassword });
    } catch (err) {
        await t.rollback();
        res.status(400).json({ success: false, message: "Failed to reset password" });
    }
    // end of placeholder
    
    // send email with new password

}
    

export {
    createUser,
    updateUser,
    getUserByUUID,
    getUserByUsername,
    updateAvatar,
    validatePasswordByUsername,
    validatePasswordByUUID,
    getAllUsers,
    deleteUser,
    uploadAvatar,
    resetPassword,
    forgotPassword,
};