/*
    An express router for the /api/v1/users endpoint.
*/
import express from "express";
import logger from "../utils/logger.mjs";
import {
    createUser,
    deleteUser,
    updateUser,
    validatePasswordByUUID,
    getAllUsers
} from "../controllers/user.mjs";
import { authenticate } from "../middleware/auth.mjs";

const router = new express.Router();
router.use(express.json());

router.post("/create", async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        !options.email ||
        !options.name ||
        !options.username ||
        !options.password ||
        options.operator === undefined
    ) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    // Create the user
    const user = await createUser({
        email: options.email,
        name: options.name,
        username: options.username,
        password: options.password,
        operator: options.operator,
    });
    if (!user) {
        res.status(500).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.get("/me", authenticate(), async (req, res) => {
    res.json({ success: true, user: {
        name: req.user.name,
        username: req.user.username,
        operator: req.user.operator,
        id: req.user.id,
        avatar: req.user.avatar,
    }
    });
});

router.put("/me", authenticate(), async (req, res) => {
    // Parse the body and validate the options
    // We just make sure of the type of the things here if they are not undefined
    // since the function will assemble a proper query
    const options = req.body;
    
    if (
        options.name !== undefined && typeof options.name !== "string" ||
        options.username !== undefined && typeof options.username !== "string" ||
        options.password !== undefined && typeof options.password !== "string"
    ) {
        res.status(400).json({ success: false, message: "Invalid fields" });
        return;
    }

    // if the operator field is set, throw now because this is not a privileged endpoint
    if (options.operator !== undefined) {
        res.status(403).json({ success: false, message: "Cannot change operator status" });
        return;
    }

    // Update the user
    const newUser = await updateUser(req.user.id, {
        name: options.name,
        username: options.username,
        password: options.password,
    });

    if (!newUser) {
        res.status(500).json({ success: false });
        return;
    }
});

router.post("/password", authenticate(), async (req, res) => {
    // Parse the body and validate the options
    const options = {
        currentPassword: req.body.currentPassword,
        password: req.body.password,        
    }

    // Test the password against the current one
    const result = await validatePasswordByUUID(req.user.id, options.currentPassword);

    if (!result) {
        res.status(401).json({ success: false, message: "Incorrect password" });
        return;
    }

    // Update the user
    const newUser = await updateUser(req.user.id, {
        password: options.password,
    });

    if (!newUser) {
        res.status(500).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.get("/list", authenticate(), async (req, res) => {
    const users = await getAllUsers();
    if (!users) {
        res.status(500).json({ success: false });
        return;
    }

    res.json({ success: true, users: users });
});

router.patch("/:id", authenticate({ requireOperator: true }), async (req, res) => {
    // Parse the body and validate the options
    const options = req.body;
    if (
        options.name !== undefined && typeof options.name !== "string" ||
        options.username !== undefined && typeof options.username !== "string" ||
        options.operator !== undefined && typeof options.operator !== "boolean" ||
        options.password !== undefined && typeof options.password !== "string"
    ) {
        res.status(400).json({ success: false, message: "Invalid fields" });
        return;
    }

    // Update the user
    const newUser = await updateUser(req.params.id, {
        name: options.name,
        username: options.username,
        operator: options.operator,
        password: options.password,
    });

    if (!newUser) {
        res.status(500).json({ success: false });
        return;
    }

    res.json({ success: true });
});

router.delete("/:id", authenticate({ requireOperator: true }), async (req, res) => {
    const result = await deleteUser(req.params.id);
    if (!result) {
        res.status(500).json({ success: false });
        return;
    }

    res.json({ success: true });
});

export default router;