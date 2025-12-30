/**
 * /api/v1/channelsrelations
 */

import express from 'express';
import { createChannelRelation, createChannelRelationByUsername, getChannelsRelations, getChannelsRelationsByChannel, deleteChannelRelation } from '../controllers/channelsrelations.mjs';

import { authenticate } from "../middleware/auth.mjs";

const router = express.Router();
router.use(express.json());

router.post('/', async (req, res) => {
    const options = req.body;
    if (!options.channelID || (!options.userID && !options.username)) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    if(options.username) {
        const user = await createChannelRelationByUsername(options);
        if (!user) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }
        res.send(user);
        return;
    } else {
            const channelRelation = await createChannelRelation(options);
            if (!channelRelation) {
                res.status(400).json({ success: false, message: "Missing required fields" });
                return;
            }
            res.send(channelRelation);
            return;
        }
});


router.get('/',  async (req, res) => {
    let channelsRelations;

    if(req.query.userID === undefined && req.query.channelID === undefined) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    if(req.query.userID != undefined) {
        channelsRelations = await getChannelsRelations(req.query.userID);

    } else if (req.query.channelID != undefined) {
        channelsRelations = await getChannelsRelationsByChannel(req.query.channelID);
    }

    if (!channelsRelations) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(channelsRelations);
});

router.delete('/', async (req, res) => {
    const options = req.body;
    if (!options.channelID || !options.userID) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    const channelRelation = await deleteChannelRelation(options);
    if (!channelRelation) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(channelRelation);
}
);

export default router;
