// router for avatars with busboy

import express from "express";
import fileUpload from "express-fileupload";
import { updateAvatar } from "../controllers/user.mjs";
import { saveFile, deleteFile } from "../controllers/avatar.mjs";
import { authenticate } from "../middleware/auth.mjs";

const __dirname = new URL('.', import.meta.url).pathname;

const router = new express.Router();

router.use(express.json());

router.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
    abortOnLimit: true,
}));

router.post("/:id", authenticate(), async (req, res) => {
    // Check if file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({ success: false, message: "Missing File" });
        return;
    }

    const userUUID = req.params.id;
    const file = req.files.image;

    // return if the user is trying to change someone else's avatar
    if (req.user.id !== userUUID && !req.user.operator) {
        res.status(403).json({ success: false, message: "You cannot change someone else's avatar" });
        return;
    }

    try {
        await deleteFile(userUUID);
        await saveFile(userUUID, file);
        res.status(200).json({ success: true, message: "avatar changed" });
    } catch (err) {
        res.status(400).json({ success: false, message: err });
    }
});

router.get('/:id', authenticate({ allowCookies: true }), async (req, res) => {
    const userUUID = req.params.id;
    try {
        res.sendFile(userUUID + ".png", { root: './avatars' });
    } catch (err) {
        console.log(err);
        res.status(404).json({ success: false, message: "Avatar not found" });
    }
});


router.delete('/:id', authenticate(), async (req, res) => {
    const userUUID = req.params.id;

    // return if the user is trying to delete someone else's avatar
    if (req.user.id !== userUUID && !req.user.operator) {
        res.status(403).json({ success: false, message: "You cannot delete someone else's avatar" });
        return;
    }

    try {
        await deleteFile(userUUID);
        await updateAvatar(userUUID, null);
        res.status(200).json({ success: true, message: "Avatar deleted" });
    } catch (err) {
        res.status(404).json({ success: false, message: "Avatar not found" });
    }
});

export default router;