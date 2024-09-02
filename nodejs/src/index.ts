import type { Request, Response, NextFunction } from "express";

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

import * as faceapi from "face-api.js";
import {
    canvas,
    faceDetectionNet,
    faceDetectionOptions,
    saveFile,
} from "./config/face-api.js";

import "dotenv/config";

// Constants
const HOST = process.env.HOST as string;
const PORT = Number(process.env.PORT) || 3001;

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({
    server: httpServer,
    host: HOST,
    maxPayload: 64 * 1024,
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
// SETUP WEBSOCKET
//
setupWebsocket(wss, HOST, PORT);

//
// ERROR HANDLER
//
function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (res.headersSent) return next(err);

    res.status(500);
    res.render("error", { error: err });
}
app.use(errorHandler);

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

/*
(async function () {
    const weightDirectory = path.join(__dirname, "./assets/weights");
    await faceDetectionNet.loadFromDisk(weightDirectory);

    const imgPath = path.join(__dirname, "../detect.png");
    const img = (await canvas.loadImage(imgPath)) as any;
    console.log(img);
    const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);

    const out = faceapi.createCanvasFromMedia(img) as any;
    faceapi.draw.drawDetections(out, detections);

    saveFile("faceDetection.jpg", out.toBuffer("image/jpeg"));
    console.log("done, saved results to out/faceDetection.jpg");
})();
*/

export { wss, httpServer, HOST, PORT };
