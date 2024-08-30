import type { Request } from "express";
import type { WebSocketServer } from "ws";
import type { WebSocketCustom } from "../types/ws";

import url from "url";
import { WebSocketSourceEnum } from "../enums/ws.enum";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "node:stream";
import path from "path";
import Worker from "web-worker";

import "dotenv/config";

export const readStreamEsp32CamSecurityGateImg = new Readable({
    read() {},
});

const transformInfo = {
    frameCount: 0,
    size: 0,
};

setInterval(() => {
    console.log({
        frame: transformInfo.frameCount / 10 + "FPS",
        size:
            parseFloat(transformInfo.size / 1024 / 1024 + "").toFixed(2) + "Mb",
        speedAvg:
            parseFloat(transformInfo.size / 10 / 1024 + "").toFixed(2) + "Kbps",
    });

    transformInfo.frameCount = 0;
    transformInfo.size = 0;
}, 10_000);

export default function setupWebsocket(
    wss: WebSocketServer,
    HOST: string,
    PORT: number
) {
    wss.on(
        "connection",
        function connection(ws: WebSocketCustom, req: Request) {
            const { query } = url.parse(req.url, true);
            let source = query.source || WebSocketSourceEnum.INVALID_SOURCE;
            if (Array.isArray(source)) source = source[0];

            ws.id = uuidv4();
            ws.source = source as string;
            console.log(`Client ${ws.id} connected`);
            ws.on("error", console.error);

            const worker = new Worker(
                path.join(__dirname, "./workers/face-detection.worker.ts"),
            );
            worker.addEventListener("message", (e) => {
                console.log(e.data);
            });
            worker.postMessage(123);

            switch (ws.source) {
                case WebSocketSourceEnum.ESP32CAM_SECURITY_GATE_SEND_IMG:
                    ws.once("message", async (buffer: Buffer) => {
                        const { ffmpegCommand } = await import(
                            "./ffmpeg.service"
                        );

                        ffmpegCommand.run();
                    });

                    // Handle append video frames to stream
                    ws.on("message", async function message(buffer: Buffer) {
                        transformInfo.frameCount++;
                        transformInfo.size += buffer.byteLength;

                        readStreamEsp32CamSecurityGateImg.push(buffer);
                    });

                    break;

                default:
                    console.log("Source is not valid!");
                    ws.close();
            }
        }
    );

    wss.on("listening", () => {
        console.log(`WebSocket Server is listening on ws://${HOST}:${PORT}`);
    });

    wss.on("error", console.log);

    wss.on("close", () => {
        console.log("Websocket is closed!");
    });
}
