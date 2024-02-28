/*
    Express middleware to check if a user has access to a channel.
*/

import { getChannelsRelations } from "../controllers/channelsrelations.mjs";

import logger from "../utils/logger.mjs";

const callerName = "Access";

// We need to return middleware to be able to support our own arguments.

const hasAccessToChannel = () => {

    return async (req, res, next) => {
        const userID = req.user.id;
        const channelID = req.query.channelID;

        if (!userID || !channelID) {
            logger.error("Missing required field", { caller: callerName });
            return res.status(400).json({ error: "Missing required field" });
        }
        console.log(userID, "userID");
        const channelsRelations = await getChannelsRelations(userID);

        console.log(channelsRelations, "channelsRelations")
        if (channelsRelations === null) {
            logger.error("Failed to get channels relations", { caller: callerName });
            return res.status(500).json({ error: "Failed to get channels relations" });
        }
        const channelRelation = channelsRelations.find(relation => relation.channelID === channelID);
        if (!channelRelation) {
            logger.error("User does not have access to the channel", { caller: callerName });
            return res.status(403).json({ error: "User does not have access to the channel" });
        }

        next();
    }

}

export {
    hasAccessToChannel,
}