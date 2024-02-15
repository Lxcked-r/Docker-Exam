/**
 * /api/v1/notifications
 */
import express from 'express';
import { getNotifications, createNotification } from '../controllers/notifications.mjs';

import { authenticate } from "../middleware/auth.mjs";

const router = express.Router();
router.use(express.json());

router.get('/', authenticate(), async (req, res) => {
    const options = req.query;
    const notifications = await getNotifications(options.userID);
    if (!notifications) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(notifications);
});

router.post('/', authenticate(), async (req, res) => {
    const options = req.body;
    if(!options.userID || !options.messageID) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    const notification = await createNotification(options);
    if (!notification) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(notification);
});

export default router;