/**
 * /api/v1/channels
*/

import express from 'express';
import { createChannel } from '../controllers/channels.mjs';

import { authenticate } from "../middleware/auth.mjs";

const router = express.Router();
router.use(express.json());

router.post('/', authenticate(), async (req, res) => {

    const options = req.body;
    if(!options.name) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    if (!options.users) {
        options.users = [];
    }

    const channel = await createChannel(options);
    if (!channel) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(channel);
});

export default router;