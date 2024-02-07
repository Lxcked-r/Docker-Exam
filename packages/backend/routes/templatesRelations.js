/*
    An express router for the /api/v1/templatesRelations endpoint.
*/
import express from "express";
import logger from "../utils/logger.mjs";
import { createTemplatesRelation } from "../controllers/templateRelations.mjs";

const router = new express.Router();
router.use(express.json());

router.post("/create", async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        !options.userID ||
        !options.templateID
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Create the template relation
    const templateRelation = await createTemplatesRelation({
        userID: options.userID,
        templateID: options.templateID,
    });
    if (!templateRelation) {
        res.status(400).json({ success: false });
        return;
    }

    res.json({ success: true });
});

export default router;