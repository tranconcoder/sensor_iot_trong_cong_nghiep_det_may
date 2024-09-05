// Express app
import express from "express";
import handleRoute from "./routes";
import bodyParser from "body-parser";

// Handlebars
import path from "path";
import SetupHandlebars from "./services/handlebars.service";

// Http server
import { createServer } from "http";

// Websocket Server
import setupWebsocket from "./services/websocket.service";
import { WebSocketServer } from "ws";

// Morgan
import morgan from "morgan";

// Mongoose
import connectDb from "./config/database/mongoose.config";

// Error handler
import handleError from "./utils/handleError.util";

import "dotenv/config";
import { loadModels } from "./utils/faceApiJs.util";

// Constants
const HOST = process.env.HOST as string;
const PORT = Number(process.env.PORT) || 3001;

// Server
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({
    server: httpServer,
    host: HOST,
    maxPayload: 256 * 1024,
});

//
// MORGAN
//
app.use(morgan("tiny"));

//
// BODY PARSER
//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//
// STATIC FILES
//
app.use("/public", express.static(path.join(__dirname, "../public")));

//
// HANDLEBARS
//
const setupExHbs = new SetupHandlebars(app);
setupExHbs.setup();

//
// HANDLE ROUTE
//
handleRoute(app);

//
// SETUP WEBSOCKET, FACE API JS
//
// Start streaming came
loadModels()
    .then(() => import("./services/ffmpeg.service.js"))
    .then(({ ffmpegCommand }) => {
        ffmpegCommand.run();
    })
    // Setup websocket
    .then(() => {
        console.log("FaceApiJs Models loaded successfully!");
        return setupWebsocket(wss, HOST, PORT);
    });

//
// ERROR HANDLER
//
app.use(handleError);

//
// START SERVER
//
httpServer.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

//
// MONGOOSE
//
connectDb()
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Connect fail to database!");
    });

export { wss, httpServer, HOST, PORT };
