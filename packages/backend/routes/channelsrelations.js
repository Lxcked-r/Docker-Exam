/**
 * /api/v1/channelsrelations
 */

import express from 'express';
import { createChannelRelation, getChannelsRelations } from '../controllers/channelsrelations.mjs';

import { authenticate } from "../middleware/auth.mjs";

const router = express.Router();
router.use(express.json());

router.post('/', async (req, res) => {
    const options = req.body;
    if (!options.channelID || !options.userID) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    const channelRelation = await createChannelRelation(options);
    if (!channelRelation) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(channelRelation);
});

router.get('/', authenticate(), async (req, res) => {
    const channelsRelations = await getChannelsRelations(req.query.userID);
    if (!channelsRelations) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(channelsRelations);
});

export default router;
