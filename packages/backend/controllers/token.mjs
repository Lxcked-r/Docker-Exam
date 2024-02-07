/*
    This file exposes functions to work with rows database tokens.
*/

import Token from "../models/token.mjs";
import { db } from "../utils/database.mjs";
import { randomBytes } from "crypto";
import { getUserByUUID } from "./user.mjs";
import logger from "../utils/logger.mjs";

const callerName = "TokenController";

const createToken = async (options) => {
    // Validate the options
    if (
        !options.userId
    ) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    // Ensure the user exists
    const user = await getUserByUUID(options.userId);
    if (!user) {
        logger.error("User does not exist", { caller: callerName });
        return null;
    }

    const t = await db.transaction();
    try {
        const token = await Token.create({
            token: randomBytes(64).toString("hex"),
            userId: options.userId,
            revoked: false,
        }, { transaction: t });
        await t.commit();
        logger.info(`Created token ${token.id}`, { caller: callerName });
        return token;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to create token", { caller: callerName });
        logger.error(err, { caller: callerName });
        return null;
    }
};

const validateToken = async (token) => {
    // Validate the token
    if (!token) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    // Get the token from the database
    const dbToken = await Token.findOne({
        where: {
            token: token,
        },
    });
    if (!dbToken) {
        logger.error("Token does not exist", { caller: callerName });
        return null;
    }

    // Get the user from the token
    const user = await getUserByUUID(dbToken.userId);
    if (!user) {
        logger.error("User does not exist", { caller: callerName });
        return null;
    }

    return user;
};

const deleteTokenByOpaqueString = async (token) => {
    // Validate the token
    if (!token) {
        logger.error("Missing required field", { caller: callerName });
        return false;
    }

    // Get the token from the database
    const dbToken = await Token.findOne({
        where: {
            token: token,
        },
    });
    if (!dbToken) {
        logger.error("Token does not exist", { caller: callerName });
        return false;
    }

    const t = await db.transaction();

    // Revoke the token
    try {
        const result = await Token.update({
            revoked: true,
        }, {
            where: {
                id: dbToken.id,
            },
            transaction: t,
        });
        await t.commit();
        logger.info(`Revoked token ${dbToken.id}`, { caller: callerName });
        return true;
    } catch (err) {
        await t.rollback();
        logger.error("Failed to delete token", { caller: callerName });
        logger.error(err, { caller: callerName });
        return false;
    }
}

const deleteAllTokensByUserId = async (userId) => {
    // Validate the user id
    if (!userId) {
        logger.error("Missing required field", { caller: callerName });
        return false;
    }

    // Get the tokens from the database
    const dbTokens = await Token.findAll({
        where: {
            userId: userId,
        },
    });
    if (!dbTokens) {
        logger.error("Token does not exist", { caller: callerName });
        return false;
    }

    const t = await db.transaction();

    // Delete the tokens
    try {
        result = await Token.update({
            revoked: true,
        }, {
            where: {
                userId: userId,
            },
            transaction: t,
        });
        logger.info(`Revoked ${dbTokens.length} tokens`, { caller: callerName });
        return true;
    } catch (err) {
        logger.error("Failed to revoke tokens", { caller: callerName });
        logger.error(err, { caller: callerName });
        return false;
    }
}

export {
    createToken,
    validateToken,
    deleteTokenByOpaqueString,
    deleteAllTokensByUserId,
};