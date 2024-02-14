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

import channelsRelationsRouter from "./routes/channelsrelations.js";
app.use("/api/v1/channelsrelations", channelsRelationsRouter);

  
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

const synced = await syncModels();
if (!synced) {
    logger.error("Could not sync models with the database", { caller: caller });
    process.exit(1);
}


const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
});


const decryptData = (data) => {
    const secret = "abcde";
    return JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data,  secret, 
    {
        keySize: 128 / 8,
        iv: secret,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })));
}

io.on('connection', async socket => {
    socket.on('channel', async (data) => {
        data = await decryptData(data);
        socket.join(data.channelID);
        console.log(data.userID,'joined channel', data.channelID)
    });
    socket.on('message', async (data) => {
        
        data = await decryptData(data);
        io.to(data.channelID).emit("message", data);
        io.to(data.channelID).emit("notif", {Notif: "New Message"});
    });
    socket.on("typing", async (data) => {
        data = await decryptData(data);
        io.to(data.channelID).emit("typing", data);
    });
    
});
httpServer.listen(3001);
