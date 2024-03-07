/**
 * /api/v1/friends
 */

import express from 'express';
import { createFriend, getFriends, getFriend, getFriendsByUserID, deleteFriend, acceptFriend } from '../controllers/friends.mjs';
import { createChannel } from '../controllers/channels.mjs';
import { createChannelRelation } from '../controllers/channelsRelations.mjs';

import { authenticate } from "../middleware/auth.mjs";
import logger from '../utils/logger.mjs';

const router = express.Router();
router.use(express.json());

router.post('/', authenticate(), async (req, res) => {
    const options = req.body;
    const friend = await createFriend(options);
    if (!friend) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(friend);
});

router.put('/:id', authenticate(), async (req, res) => {
    const options = req.body;
    try {
    let friend = await acceptFriend(req.params.id);

    friend = await getFriend(req.params.id);

    const channel = await createChannel({ name: 'userChannel', id: req.params.id, type:'private', owner: req.user.id});
    const channelRelation = await createChannelRelation({ channelID: channel.id, userID: req.user.id });
    const channelRelation2 = await createChannelRelation({ channelID: channel.id, userID: friend.userID });
    if (!friend || !channel || !channelRelation) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(friend);
    } catch (error) {
        logger.error(error);
    }
});

router.get('/', authenticate(), async (req, res) => {
    try {
    const friends = await getFriends(req.user.id);
    if (!friends) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
        res.send(friends);
    } catch (error) {
        console.log(error);
    }
});

router.get('/:id', authenticate(), async (req, res) => {
    const friend = await getFriends(req.params.id);
    if (!friend) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(friend);
});

router.get('/user/:id', authenticate(), async (req, res) => {
    const friends = await getFriendsByUserID(req.params.id);
    if (!friends) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(friends);
});

router.delete('/:id', authenticate(), async (req, res) => {
    const friend = await deleteFriend(req.params.id);
    if (!friend) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(friend);
});

export default router;