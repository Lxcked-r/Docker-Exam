/**
 * /api/v1/messages
 * Messages management routes
*/

import express from 'express';
import { createMessage, getMessages } from '../controllers/messages.mjs';

const router = express.Router();

/**
 * Create a new message.
 * @name POST /api/v1/messages
 * @param {string} text - The message's text.
 * @param {string} userId - The user's id.
 * @returns {Object} The created message.
 */
router.post('/', async (req, res) => {
    const message = await createMessage(req.body);
    if (!message) {
        return res.status(400).send('Missing required field');
    }
    res.send(message);
});

/**
 * Get all messages between 2 users.
 * @name GET /api/v1/messages
 * @param {string} userId - The user's id.
 * @param {string} destinationUserId - The destination user's id.
 * @returns {Array<Object>} All messages.
 */
router.get('/', async (req, res) => {
    const messages = await getMessages(req.query.userId, req.query.destinationUserId);
    if (!messages) {
        return res.status(400).send('Missing required field');
    }
    res.send(messages);
});

export default router;