/**
 * /api/v1/friends
 */

import express from 'express';
import { createFriend, getFriends, getFriend, getFriendsByUserID, deleteFriend } from '../controllers/friends.mjs';

import { authenticate } from "../middleware/auth.mjs";

const router = express.Router();
router.use(express.json());

router.post('/', authenticate(), async (req, res) => {
    const options = req.body;
    const friend = await createFriend(options, req.user.id);
    if (!friend) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(friend);
});

router.get('/', authenticate(), async (req, res) => {
    try {
    const friends = await getFriends(req.user.id);
    if (!friends) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    console.log(friends);
        res.send(friends);
    } catch (error) {
        console.log(error);
    }
});

router.get('/:id', authenticate(), async (req, res) => {
    const friend = await getFriend(req.params.id);
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