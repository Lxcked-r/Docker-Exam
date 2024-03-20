/**
 * /api/v1/messages
 * Messages management routes
*/

import express from 'express';
import { createMessage, getMessages } from '../controllers/messages.mjs';

import { authenticate } from "../middleware/auth.mjs";

import { hasAccessToChannel } from '../middleware/access.mjs';

const router = express.Router();
router.use(express.json());

/**
 * Create a new message.
 * @name POST /api/v1/messages
 * @param {string} text - The message's text.
 * @param {string} userID - The user's id.
 * @returns {Object} The created message.
 */
router.post('/', authenticate(), hasAccessToChannel(), async (req, res) => {
    const body = req.body;
    if (!body.text || !body.channelID || !body.userID)
    {
        return res.status(400).send('Missing required field');
    }
    const message = await createMessage(body);
    if (!message.text || !message.userID) {
        return res.status(400).send('Missing required field');
    }
    res.send(message);
});

/**
 * Get all messages between 2 users.
 * @name GET /api/v1/messages
 * @param {string} channelID - The destination user's id.
 * @param {string} page - The page number.
 * @returns {Array<Object>} All messages.
 */
router.get('/', authenticate(), hasAccessToChannel(), async (req, res) => {
    const messages = await getMessages(req.query.channelID, req.query.page);
    if (!messages) {
        return res.status(400).send('Missing required field');
    }
    res.send(messages);
});

export default router;