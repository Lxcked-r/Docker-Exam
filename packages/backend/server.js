import Express from "express";
import cookieParser from "cookie-parser";

import logger from "./utils/logger.mjs";
import { connect, syncModels } from "./utils/database.mjs";

import { Server } from 'socket.io';

import { createServer } from "http";

import CryptoJS from "crypto-js";

const caller = "Server";

const app = new Express();

// App wide logging
app.use((req, res, next) => {
	logger.info(`${req.ip} ${req.method} ${req.url}`, { caller: caller });
	next();
});

app.use(cookieParser());

// Allow CORS while in development
if (process.env.NODE_ENV !== "development") {
    // Allow CORS
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "http://localhost:5173");
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS, HEAD, PUT");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
        next();
    });

    // Options handler
    app.options("*", (req, res) => {
        res.status(200).send();
    });
}

// Routers
import usersRouter from "./routes/users.js";
import sessionRouter from "./routes/session.js";
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/session", sessionRouter);

import messagesRouter from "./routes/messages.js";
app.use("/api/v1/messages", messagesRouter);

import channelsRouter from "./routes/channels.js";
app.use("/api/v1/channels", channelsRouter);

import avatarsRouter from "./routes/avatars.js";
app.use("/api/v1/avatars", avatarsRouter);

import channelsRelationsRouter from "./routes/channelsrelations.js";
import { createMessage } from "./controllers/messages.mjs";
app.use("/api/v1/channelsrelations", channelsRelationsRouter);

import notificationsRouter from "./routes/notifications.js";
import { createNotification } from "./controllers/notifications.mjs";
import { updateAvatar } from "./controllers/user.mjs";
app.use("/api/v1/notifications", notificationsRouter);


  
// Default route
app.get("/", (req, res) => {
    res.json({ success: true });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ success: false });
})

// 404 handler
app.use((req, res) => {
	res.status(404).json({ success: false, message: "Resource not found" });
});

// Wait for the database to connect before starting the server
const dbConnected = await connect();
if (!dbConnected) {
    logger.error("Could not connect to the database", { caller: caller });
    process.exit(1);
}

// Sync the models with the database
const synced = await syncModels();
if (!synced) {
    logger.error("Could not sync models with the database", { caller: caller });
    process.exit(1);
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
        return null;
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

// Socket.io
io.on('connection', async socket => {

    // sync user to channel (socket.io room)
    socket.on('channel', async (data) => {
        data = await decryptData(data);
        socket.join(data.channelID);
    });

    // send message in db and to all users in a channel (socket.io room)
    socket.on('message', async (data) => {

        data = await decryptData(data);
        if(data === null) {
            logger.error("Failed to decrypt message", { caller: caller });
            return;
        }

        const message = createMessage(data);
        io.to(data.channelID).emit("message", data);
        //io.to(data.channelID).emit("notification", data);
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

// Start the server
httpServer.listen(3001);
