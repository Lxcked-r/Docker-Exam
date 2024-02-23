/*
    /api/v1/session
    Session management routes
*/
import express from "express";
import logger from "../utils/logger.mjs";
import { validatePasswordByUsername, validatePasswordByUUID, getUserByUsername } from "../controllers/user.mjs";
import { createToken, deleteTokenByOpaqueString, deleteAllTokensByUserId } from "../controllers/token.mjs";
import { authenticate } from "../middleware/auth.mjs";

import fs from "fs";


const router = new express.Router();
router.use(express.json());

const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

router.post("/begin", async (req, res) => {
    // Validate body
    const body = req.body;
    if (
        !body.username || typeof body.username !== "string" ||
        !body.password || typeof body.password !== "string"
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Verify password 
    const check = await validatePasswordByUsername(body.username, body.password);    
    if (!check) {
        const origin = req.get("origin");

        await sleep(5000).then(() => fs.appendFileSync("logs.txt", `Failed login attempt from ${origin} with username ${body.username}\n`));

        res.status(401).json({ success: false, message: "Invalid username or password" });
        return;
    }

    // Get the user id
    const user = await getUserByUsername(body.username);

    // Generate access token
    const token = await createToken({ userId: user.id });
    if (!token) {
        res.status(500).json({ success: false, message: "Failed to create access token" });
        return;
    }

    // Return the access token
    res.json({ success: true, token: token.token });
});

router.post("/end", authenticate(), async (req, res) => {
    // Get the token from the request
    const accessToken = req.headers["authorization"];

    // Try to delete the token
    const deleted = await deleteTokenByOpaqueString(accessToken);

    if (!deleted) {
        res.status(500).json({ success: false, message: "Failed to delete token" });
        return;
    }

    res.json({ success: true });
});

router.post("/end_all", authenticate(), async (req, res) => {
    // Get the user id from the request
    const userId = req.user.id;

    // Verify the password from the body
    const body = req.body;
    if (!body.password || typeof body.password !== "string") {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    const check = await validatePasswordByUUID(req.user.id, body.password);

    if (!check) {
        res.status(401).json({ success: false, message: "Invalid password" });
        return;
    }

    // Try to delete the tokens
    const deleted = await deleteAllTokensByUserId(userId);

    if (!deleted) {
        res.status(500).json({ success: false, message: "Failed to delete token" });
        return;
    }

    res.json({ success: true });
});

router.get("/check", authenticate(), async (req, res) => {
    // If we got here, the user is authenticated
    res.json({ success: true });
});

export default router;