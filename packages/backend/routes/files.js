/**
 * /api/v1/files
 */

import express from 'express';
import { createFile, getFileById, getFilesByChannelId, getFileName} from '../controllers/files.mjs';
import { authenticate } from '../middleware/auth.mjs';

import fs from 'fs';

import multer from 'multer';

import uploadHandler from '../middleware/uploadHandler.mjs';

import logger from '../utils/logger.mjs';

const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(express.static('../files'));

router.post('/', authenticate(), upload.any(), async (req, res) => {
    


    const options = req.body;
    const fileName = req.files[0].originalname;

    options.file = req.files[0];

    options.size = options.size || req.files[0].size;
    options.name = options.name || fileName;
    if (!options.channelID || !options.name || !options.type) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    const fileOnDisk = req.files[0];


    const randomUUDI = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const randomedFileName = `${randomUUDI}-${fileOnDisk.originalname}`;

    const path = `./files/${randomedFileName}`;
    fs.writeFileSync(path, fileOnDisk.buffer);
    options.path = path;

    const file = await createFile(options);
    if (!file) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(file);
});

router.get('/:id',/* authenticate(), */async (req, res) => {

    const file = await getFileById(req.params.id);
    if (!file) {
        res.status(404).json({ success: false, message: "File not found" });
        return;
    }
    const fileSelected = fs.readFileSync(file.path, { root: '.' });
    try {
        fileSelected.toString();
    } catch (error) {
        file.type = 'octet/stream';
    }
    
    res.sendFile(file.path, { root: '.' });
});

router.get('/', authenticate(), async (req, res) => {
    const files = await getFilesByChannelId(req.query.channelID);
    if (!files) {
        res.status(404).json({ success: false, message: "Files not found" });
        return;
    }
    res.send(files);
});

router.get('/name/:id',  async (req, res) => {
    const file = await getFileName(req.params.id);
    if (!file) {
        res.status(404).json({ success: false, message: "File not found" });
        return;
    }
    const data = {
        name: file.name,
        size: file.size,
    };
    res.send(data);
});

export default router;
