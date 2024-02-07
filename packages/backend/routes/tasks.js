/*
    An express router for the /api/v1/tasks endpoint.
*/
import express from "express";
import { createTask } from "../controllers/task.mjs";
import { deleteTask } from "../controllers/task.mjs";
import { updateTask } from "../controllers/task.mjs";
import { getTasks } from "../controllers/task.mjs";

const router = new express.Router();
router.use(express.json());

router.post("/create", async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        !options.templateId ||
        options.complete === undefined
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Create the task
    const task = await createTask({
        templateId: options.templateId,
        complete: options.complete,
    });
    if (!task) {
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

    // Delete the task
    const task = await deleteTask({
        id: options.id,
    });
    if (!task) {
        res.status(400).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.post("/update", async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        !options.id ||
        options.complete === undefined
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Update the task
    const task = await updateTask({
        id: options.id,
        complete: options.complete,
    });
    if (!task) {
        res.status(400).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.get("/list", async (req, res) => {
    const options = req.query;
    let tasks;
    // Parse the query
    if (!options.id) {
        // Get all tasks
        tasks = await getTasks();
    } else {
        // Get a task by its ID
        tasks = await getTasks(options.id);
    }

    // if no task was found, return an error
    if (!tasks) {
        res.status(400).json({ success: false });
        return;
    }

    // Return the task
    res.json({ success: true, tasks });
});


export default router;