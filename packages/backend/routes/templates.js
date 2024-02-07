/*
    An express router for the /api/v1/templates endpoint.
*/

import express from "express";
import logger from "../utils/logger.mjs";
import { createTemplate } from "../controllers/template.mjs";
import { deleteTemplate } from "../controllers/template.mjs";
import { updateTemplate } from "../controllers/template.mjs";
import { getTemplates } from "../controllers/template.mjs";

const router = new express.Router();
router.use(express.json());

router.post("/create", async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        !options.name ||
        !options.body ||
        !options.schedule ||
        !options.maxAge
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Create the template
    const template = await createTemplate({
        name: options.name,
        body: options.body,
        schedule: options.schedule,
        maxAge: options.maxAge,
        enabled: options.enabled,
    });
    if (!template) {
        res.status(500).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.post("/delete", async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        !options.id
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Delete the template
    const template = await deleteTemplate({
        id: options.id,
    });
    if (!template) {
        res.status(500).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.post("/update", async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        !options.id ||
        !options.name ||
        !options.body ||
        !options.schedule ||
        !options.maxAge
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Update the template
    const template = await updateTemplate({
        id: options.id,
        name: options.name,
        body: options.body,
        schedule: options.schedule,
        maxAge: options.maxAge,
        enabled: options.enabled,
    });
    if (!template) {
        res.status(400).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.get("/list", async (req, res) => {
    const options = req.query;

    let templates;
    if (!options.id) {
        // return all templates
        templates = await getTemplates();
    } else {
        // return the template with the specified id
        templates = await getTemplates(options.id);
    }

    // Check if the template exists and if not return an error
    if (!templates) {
        res.status(400).json({ success: false });
        return;
    }

    if(!templates.maxAge) {
        // convert maxAge BigInt values to Number
        for (const template in templates) {
            templates[template].maxAge = Number(templates[template].maxAge);
        }
    } else {
        templates.maxAge = Number(templates.maxAge);
    }

    
    // return the template
    res.json({ success: true, templates: templates });
});

export default router;