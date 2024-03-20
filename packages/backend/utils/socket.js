import { createServer } from "http";
import { Server } from "socket.io";

import { createMessage, getMessageByID } from "../controllers/messages.mjs";

import { getChannelsRelations, getChannelsRelationsByChannel } from "../controllers/channelsrelations.mjs";

import CryptoJS from "crypto-js";
import { getChannelById } from "../controllers/channels.mjs";
import { decryptData, encrypt } from "./crypter.js";

const serverApp = async (app) => {

    // create server from app
    const httpServer = createServer(app);

    // Socket.io server instance from http server and handle cors
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Socket.io
    io.on('connection', async socket => {
        console.log("connected");

        
        socket.on("newFriend" , async (data) => {
            data = await decryptData(data);
            if(data === null) {
                logger.error("Failed to decrypt message", { caller: caller });
                return;
            }
            const channelsRelations = await getChannelsRelations(data.userID);
            io.to(data.userID).emit("newFriend", "New friend request");
        });

        socket.on("newChan" , async (data) => {
            data = await decryptData(data);
            if(data === null) {
                logger.error("Failed to decrypt message", { caller: caller });
                return;
            }
            console.log(data.userID + " joined A new channels relations" + data.channelID);
            const channelsRelations = await getChannelsRelationsByChannel(data.channelID);
            io.to(data.userID).emit("newChan", "ww");

            const msgData = {text: "[SERVER] : Say hello to " + channelsRelations[channelsRelations.length-1].User.username + ", he is new to this channel", channelID: data.channelID, userID: "server"};

            
            let message = await createMessage(msgData);

            console.log(message);
            const temp = await getMessageByID(message.id);
            io.to(data.channelID).emit("message", temp);

            io.to(data.channelID).emit("newUser", channelsRelations);
        });

        // sync user to channel (socket.io room)
        socket.on('channel', async (data) => {
            data = await decryptData(data);

            console.log(data.userID + " joined " + data.channelID);

            socket.join(data.channelID);
            socket.join(data.userID);
        });

        // send message in db and to all users in a channel (socket.io room)
        socket.on('message', async (data) => {
            data = await decryptData(data);
            if(data === null) {
                logger.error("Failed to decrypt message", { caller: caller });
                return;
            }

        /*    if(data.text === "" || data.text === null || data.text.length > 300 || data.text.length < 1) {
                return;
            }*/

            let createdAt = new Date();
            data.createdAt = createdAt;

            console.log(data.createdAt);
            
            let dataV2 = data;

            dataV2.text = await encrypt(data.text);

            console.log(dataV2.text)

            let message = await createMessage(dataV2);
            const tempMessage = await getMessageByID(message.id);
            const tempChannel = await getChannelById(data.channelID);
            message.user = tempMessage.User;
            io.to(data.channelID).emit("notification", {message: message, user: tempMessage.User, channel: tempChannel});
            io.to(data.channelID).emit("message", data);
        });

        // send typing notification to all users in a channel (socket.io room)
        socket.on("typing", async (data) => {
            data = await decryptData(data);        
            if(data === null) {
                logger.error("Failed to decrypt message", { caller: caller });
                return;
            }
            io.to(data.channelID).emit("typing", data);
        });

        // update avatar in db and for all users thats see him (socket.io room)
        socket.on("avatar", async (data) => {

            data = await decryptData(data);
            if(data === null) {
                logger.error("Failed to decrypt message", { caller: caller });
                return;
            }

            console.log(await decryptFile(data.image));
            console.log("qewq");
            try {
                await updateAvatar(data.userID, data.path);
            } catch (err) {
                logger.error(err, { caller: caller });
                return;
            }
            io.to(data.channelID).emit("avatar", data);
        });
        
    });

    const start = () => {
        // Start the server
        httpServer.listen(3001);
    }

    start();

}

// Export the server
export default serverApp;