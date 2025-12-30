/**
 * /api/v1/channels
*/

import express from 'express';
import { createChannel, getChannelById, updateAvatar } from '../controllers/channels.mjs';

import { authenticate } from "../middleware/auth.mjs";

const router = express.Router();
router.use(express.json());

router.post('/',  async (req, res) => {

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

router.get('/', async (req, res) => {
    const options = req.query;
    const channel = await getChannelById(options.id);
    if (!channel) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(channel);
});

router.post('/avatar',  async (req, res) => {
    console.log(req);
    try {
        const options = req.body;
        options.files = req.files;
        const channel = await updateAvatar(options);
        if (!channel) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }
        res.send(channel);
    } catch (error) {
        console.log(error);
    }
});

export default router;