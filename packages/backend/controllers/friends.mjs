/*
    This file exposes functions to work with rows of the Friends table in the database.
*/

import Friend from "../models/friends.mjs";
import { db } from "../utils/database.mjs";
import logger from "../utils/logger.mjs";
import User from "../models/user.mjs";

const callerName = "FriendController";

/**
 * Create a new friend request.
 * @param {Object} options - The friend's information.
 * @param {string} options.userID - The user's id.
 * @param {string} options.friendID - The friend's id.
 * @returns {Promise<Object>} The created friend request.
 */
const createFriend = async (options) => {
    // Validate the options
    if (!options.userID || !options.friendID) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    //check if friend request already exists
    const friendExists = await Friend.findOne({
        where: {
            userID: options.userID,
            friendID: options.friendID
        }
    });

    if (friendExists) {
        logger.error("Friend request already exists", { caller: callerName });
        //return error message
        return null;
    }

    try {
        const friend = await Friend.create({
            userID: options.userID,
            friendID: options.friendID,
        }, { transaction });

        logger.info(`Created friend request ${friend.id}`, { caller: callerName });

        await transaction.commit();

        return friend;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Accept a friend request.
 * @param {string} id - The friend's id.
 * @returns {Promise<Object>} The accepted friend request.
 */

const acceptFriend = async (id) => {
    // Validate the options
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const friend = await Friend.update({
            pending: false
        }, {
            where: {
                id
            }
        }, { transaction });

        logger.info(`Accepted friend request ${id}`, { caller: callerName });

        await transaction.commit();

        return friend;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Get a friend request.
 * @param {string} id - The friend's id.
 * @returns {Promise<Object>} The friend request.
 */
const getFriend = async (id) => {
    // Validate the options
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const friend = await Friend.findOne({
            where: {
                id
            }
        });

        logger.info(`Got friend request ${id}`, { caller: callerName });

        return friend;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

/**
 * Get a friend request by User ID.
 * @param {string} id - The user's id.
 * @returns {Promise<Array<Object>>} The friend requests.
 */
const getFriendsByUserID = async (id) => {
    // Validate the options
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const friends = await Friend.findAll({
            where: {
                userID: id
            }
        });

        logger.info(`Got friends for user ${id}`, { caller: callerName });

        return friends;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

/**
 * Get a friend request by Friend ID.
 * @param {string} id - The friend's id.
 * @returns {Promise<Array<Object>>} The friend requests.
 */
const getFriendsByFriendID = async (id) => {
    // Validate the options
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    try {
        const friends = await Friend.findAll({
            where: {
                friendID: id
            }
        });

        logger.info(`Got friends for friend ${id}`, { caller: callerName });

        return friends;
    } catch (error) {
        logger.error(error, { caller: callerName });
        return null;
    }
}

/**
 * Delete a friend request.
 * @param {string} id - The friend's id.
 * @returns {Promise<Object>} The deleted friend request.
 */
const deleteFriend = async (id) => {
    // Validate the options
    
    if (!id) {
        logger.error("Missing required field", { caller: callerName });
        return null;
    }

    const transaction = await db.transaction();

    try {
        const friend = await Friend.destroy({
            where: {
                id
            }
        }, { transaction });

        logger.info(`Deleted friend request ${id}`, { caller: callerName });

        await transaction.commit();

        return friend;
    } catch (error) {
        logger.error(error, { caller: callerName });
        await transaction.rollback();
        return null;
    }
}

/**
 * Get all friends from a user
 */
const getFriends = async (id) => {
    let friends = [];
    const friendsFromUserID = await Friend.findAll({

        include : [            
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar'],
            },
            {
                model: User,
                as: 'otherUser',
                attributes: ['id', 'username', 'avatar'],
            }
        ],
        subQuery: true,

        where: {
            userID: id
        }
    });

    friendsFromUserID.forEach(friend => {
        friends.push(friend);
    });

    const friendsFromFriendID = await Friend.findAll({
        include : [
            {
                model: User,
                as: 'otherUser',
                attributes: ["id", 'username', 'avatar'],
            },
            {
                model: User,
                as: 'user',
                attributes: ["id", 'username', 'avatar'],
            }
        ],
        subQuery: true,
        where: {
            friendID: id
        }
    });

    friendsFromFriendID.forEach(friend => {
        friends.push(friend);
    });

    return friends;
}

export {
    createFriend,
    acceptFriend,
    getFriend,
    getFriends,
    getFriendsByUserID,
    getFriendsByFriendID,
    deleteFriend
};