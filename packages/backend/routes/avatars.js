// router for avatars with busboy

import express from "express";
import fileUpload from "express-fileupload";
import { stat, rm, lstat } from "node:fs/promises"
import * as path from 'path';
import { updateAvatar } from "../controllers/user.mjs";
import { URL } from 'url';
import { authenticate } from "../middleware/auth.mjs";

const __filename = new URL('', import.meta.url).pathname;
const __dirname = new URL('.', import.meta.url).pathname;


const router = new express.Router();
router.use(express.json());
router.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
    abortOnLimit: true,
}));

router.post("/:id", authenticate(), async (req, res) => {
    // Check if file was uploaded
    if(!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({ success: false, message: "Missing File" });
        return;
    }

    const userUUID = req.params.id;
    const file = req.files.image;

    // return if the user is trying to change someone else's avatar
    if (req.user.id !== userUUID) {
        res.status(403).json({ success: false, message: "You cannot change someone else's avatar" });
        return;
    }

    try {
        await lstat(`./avatars/${userUUID}.png`);
        await rm(`./avatars/${userUUID}.png`, { recursive: true });
    } catch (err) { 
        // this is fine because it means the file doesn't exist. lstat throws an error if the file doesn't exist
    }

    await file.mv(`./avatars/${userUUID}.png`, async (err) => {
        if(err) {
            console.log(err);
            console.log(path.parse(`./avatars/${userUUID}.png`));
            res.status(400).json({ success: false, message: "Failed to upload file" });
            return;
        }
        await updateAvatar(userUUID, `./avatars/${userUUID}.png`);
        res.status(200).json({ success: true, message: "avatar changed" });
    });
});

router.get('/:id',async (req, res) => {
    const userUUID = req.params.id;
    if(userUUID === "null") {
        res.sendFile(__dirname.slice(1, -7) + 'default.png');
        return;
    }
    try {
        const file = await stat(`./avatars/${userUUID}.png`);
        res.sendFile(__dirname.slice(1, -7) + `avatars/${userUUID}.png`);
    } catch (err) {
        res.status(404).json({ success: false, message: "avatar not found" });
    }
});

router.delete('/:id', authenticate(), async (req, res) => {
    const userUUID = req.params.id;

    // return if the user is trying to delete someone else's avatar
    if (req.user.id !== userUUID) {
        res.status(403).json({ success: false, message: "You cannot delete someone else's avatar" });
        return;
    }

    try {
        await rm(`./avatars/${userUUID}.png`, {recursive:true},(err) => {
            if(err) {
                res.status(404).json({ success: false, message: "Avatar not found" });
            }});
        await updateAvatar(userUUID, null);
        res.status(200).json({ success: true, message: "Avatar deleted" });
    } catch (err) {
        res.status(404).json({ success: false, message: "Avatar not found" });
    }
});

export default router;