import { createServer } from "http";
import { Server } from "socket.io";

import { createMessage, getMessageByID, deleteMessage } from "../controllers/messages.mjs";

import { getChannelsRelations, getChannelsRelationsByChannel } from "../controllers/channelsrelations.mjs";

import { getUserByUUID } from "../controllers/user.mjs";

import CryptoJS from "crypto-js";
import { getChannelById, editChannel } from "../controllers/channels.mjs";
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

        console.log("New connection : " + socket.id);

        
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
            const channelsRelations = await getChannelsRelationsByChannel(data.channelID);
            io.to(data.userID).emit("newChan", "ww");

            const msgData = {text: "[SERVER] : Say hello to " + channelsRelations[channelsRelations.length-1].User.username + ", he is new to this channel", channelID: data.channelID, userID: "server"};

            
            let message = await createMessage(msgData);
            const temp = await getMessageByID(message.id);
            io.to(data.channelID).emit("message", temp);

            io.to(data.channelID).emit("newUser", channelsRelations);
        });

        // sync user to channel (socket.io room)
        socket.on('channel', async (data) => {
            data = await decryptData(data);

            socket.join(data.channelID);
            console.log("User " + data.userID + " joined channel " + data.channelID);
            socket.join(data.userID);

            console.log("#################################################");

            console.log(data.userID);
            console.log(io.sockets.adapter.rooms.get(data.userID));

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
            
            let dataV2 = data;

            if(data.text === null || data.text === "") {
                console.error("Message text is empty");
                return;
            }

            // check if message text is not empty or made of only spaces
            if (typeof data.text !== "string") {
                console.error("Message text must be a string");
                return;
            }
            // check if message text is empty or made of only spaces
            if (data.text.trim() === "") {
                console.error("Message text cannot be empty");
                return;
            }

            dataV2.text = await encrypt(data.text);

            let message = await createMessage(dataV2);
            const tempMessage = await getMessageByID(message.id);
            const tempChannel = await getChannelById(data.channelID);
            message.user = tempMessage.User;
            io.to(data.channelID).emit("notification", {message: message, user: tempMessage.User, channel: tempChannel});
            io.to(data.channelID).emit("message", tempMessage);
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

            try {
                await updateAvatar(data.userID, data.path);
            } catch (err) {
                logger.error(err, { caller: caller });
                return;
            }
            io.to(data.channelID).emit("avatar", data);
        });

        // check online
        socket.on("checkOnline", async (data) => {
            const friends = data.friends;
            const userID = data.userID;
            socket.join(userID);
            for (const friend of Object.entries(friends)) {

                
                console.log("################");
                if(io.sockets.adapter.rooms.get(friend[1].otherUser.id) === undefined) {
                    console.log(friend[1].otherUser.id + " is offline");
                    io.to(userID).emit("offline", friend[1]);
                } else {
                    io.to(userID).emit("online", friend[1]);
                }
            }
        });

        // ############## PONG
        socket.on("pong:join", async (data) => {
            socket.join("pong");
            io.to("pong").emit("pong:join", data);
            const tt = await io.in("pong").fetchSockets();

            let playersID = [];

            tt.forEach((obj) => {
                playersID.push(obj.id);
            })
            io.to("pong").emit("pong:players", playersID);

            //console.log(io.in("pong").fetchSockets());
        
            console.log(data);
        });

        socket.on("pong:move", async (data) => {
            data.id = socket.id;
            io.to("pong").emit("pong:move", data);
        });

        socket.on("deleteMessage", async (data) => {
            try {
                const message = await getMessageByID(data.id);
                const user = await getUserByUUID(data.user);

                if(message.User.id === user.id || user.operator === true) {
                    await deleteMessage(data.id);
                    io.to(message.channelID).emit("deleteMessage", data);
                } else {
                    return;
                }
            } catch (err) {
                console.error(err);
                return;
            }

            
        });

        socket.on("editMessage", async (data) => {
            const message = await getMessageByID(data.id);
            const user = await getUserByUUID(data.userID);

            if(message.User.id === user.id) {
                io.to(message.channelID).emit("editMessage", message);
            }

        });

        socket.on("editChannel", async (data) => {


            const channel =  await getChannelById(data.channelID);
            const user = await getUserByUUID(data.userID);


            if(channel.owner === user.id || user.operator === true) {
                try {
                    await editChannel({name: data.newName, id: data.channelID});

                    const tempChannel = await getChannelById(data.channelID);

                    io.to(data.channelID).emit("editChannel", tempChannel);
            
                } catch (err) {
                    console.error(err);
                    return;
                }
            }



        }
        );
        
    });

    io.on('disconnect', async socket => {
        console.log("Disconnected : " + socket.id);
    });

    const start = () => {
        // Start the server
        httpServer.listen(3001);
    }

    start();

}

// Export the server
export default serverApp;