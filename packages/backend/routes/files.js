/**
 * /api/v1/files
 */

import express from 'express';
import { createFile, getFileById, getFilesByChannelId } from '../controllers/files.mjs';
import { authenticate } from '../middleware/auth.mjs';

const router = express.Router();
router.use(express.json());

router.post('/', authenticate(), async (req, res) => {
    const options = req.body;
    if (!options.channelID || !options.name || !options.type) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    const file = await createFile(options);
    if (!file) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(file);
});

router.get('/:id', authenticate(), async (req, res) => {
    const file = await getFileById(req.params.id);
    if (!file) {
        res.status(404).json({ success: false, message: "File not found" });
        return;
    }
    res.send(file);
});

router.get('/', authenticate(), async (req, res) => {
    const files = await getFilesByChannelId(req.query.channelID);
    if (!files) {
        res.status(404).json({ success: false, message: "Files not found" });
        return;
    }
    res.send(files);
});

export default router;
