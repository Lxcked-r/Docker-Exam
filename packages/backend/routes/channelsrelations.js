/**
 * /api/v1/channelsrelations
 */

import express from 'express';
import { createChannelRelation, getChannelsRelations, getChannelsRelationsByChannel } from '../controllers/channelsrelations.mjs';

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

router.get('/',  async (req, res) => {
    let channelsRelations;

    if(req.query.userID === undefined && req.query.channelID === undefined) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    if(req.query.userID != undefined) {
        channelsRelations = await getChannelsRelations(req.query.userID);
        console.log("get By user ID");

    } else if (req.query.channelID != undefined) {
        channelsRelations = await getChannelsRelationsByChannel(req.query.channelID);
        console.log("get By channel ID");
    }

    if (!channelsRelations) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(channelsRelations);
});

export default router;
