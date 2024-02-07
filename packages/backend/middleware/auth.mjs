/*
    Express middleware to authenticate a user using their opaque access token.
*/
import { validateToken } from "../controllers/token.mjs";

const callerName = "Auth";

// We need to return middleware to be able to support our own arguments.
const authenticate = (options) => {
    // If we don't have options, set them to this default object
    options = options || {
        requireOperator: false,
        allowCookies: false,
    }

    return async (req, res, next) => {
        // Get the access token from the request
        let accessToken = req.headers["authorization"];

        // if there is no access token, check if we allow cookies and use that instead
        if (!accessToken && options.allowCookies) {
            const cookies = req.cookies;
            if (cookies && cookies.token) {
                accessToken = cookies.token;
            }
        }

        if (!accessToken) {
            res.status(401).json({ success: false, message: "Missing access token" });
            return;
        }

        // Get the user from the access token
        const user = await validateToken(accessToken);
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid access token" });
            return;
        }

        if (options.requireOperator) {
            // Ensure the user is an operator
            if (!user.operator) {
                res.status(403).json({ success: false, message: "Missing privileges" });
                return;
            }
        }

        // Set the user on the request
        req.user = user;

        // Call the next middleware
        next();
    };
}

export {
    authenticate,
}