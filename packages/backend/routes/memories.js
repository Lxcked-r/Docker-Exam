/**
 * api/v1/memory 
 */

import express from 'express';
import { createMemory, getMemories, getMemoryById, updateMemory, deleteMemory } from '../controllers/memory.mjs';
import { authenticate } from "../middleware/auth.mjs";
import logger from '../utils/logger.mjs';

const router = express.Router();
router.use(express.json());

router.post('/', authenticate(), async (req, res) => {
    const options = req.body;
    const memory = await createMemory(options);
    if (!memory) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(memory);
}
);

router.get('/', authenticate(), async (req, res) => {
    try {
        const memories = await getMemories(req.user.id);
        if (!memories) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }
        res.send(memories);
    } catch (error) {
        console.log(error);
    }
});

router.get('/:id', authenticate(), async (req, res) => {
    const memory = await getMemoryById(req.params.id);
    if (!memory) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(memory);
});

router.put('/:id', authenticate(), async (req, res) => {
    const options = req.body;
    try {
        let memory = await updateMemory(req.params.id, options);
        if (!memory) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }
        res.send(memory);
    } catch (error) {
        logger.error(error);
    }
});

router.delete('/:id', authenticate(), async (req, res) => {
    const memory = await deleteMemory(req.params.id);
    if (!memory) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }
    res.send(memory);
});

export default router;
