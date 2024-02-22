import { createServer } from "http";
import { Server } from "socket.io";

import { createMessage, getMessageByID } from "../controllers/messages.mjs";

import { getChannelsRelations } from "../controllers/channelsrelations.mjs";

import CryptoJS from "crypto-js";
import { getChannelById } from "../controllers/channels.mjs";

const serverApp = async (app) => {

    // Decryption
    const decryptData = (data) => {
        const secret = "abcde";
        try {
        return JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data,  secret, 
        {
            keySize: 128 / 8,
            iv: secret,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })));
        }
        catch (err) {
            console.log(err);
        }
    }

    const decryptFile = async (dataURL) => {
        
        var byteArr = b64toArray(dataURL);
        
        function b64toArray(b64Data){
        var byteCharacters = atob(b64Data);
        
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        var byteArray = new Uint8Array(byteNumbers);

        console.log(byteArray);
        return byteArray;}
    }
    
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

        // sync user to channel (socket.io room)
        socket.on('channel', async (data) => {
            data = await decryptData(data);

            console.log(data.userID + " joined " + data.channelID);

            socket.join(data.channelID);
        });

        // send message in db and to all users in a channel (socket.io room)
        socket.on('message', async (data) => {
            data = await decryptData(data);
            if(data === null) {
                logger.error("Failed to decrypt message", { caller: caller });
                return;
            }

            let createdAt = new Date();
            data.createdAt = createdAt;

            console.log(data.createdAt);

            let message = await createMessage(data);
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