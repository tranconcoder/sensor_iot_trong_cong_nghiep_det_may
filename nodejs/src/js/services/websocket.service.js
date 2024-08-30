"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStreamEsp32CamSecurityGateImg = void 0;
exports.default = setupWebsocket;
const url_1 = __importDefault(require("url"));
const ws_enum_1 = require("../enums/ws.enum");
const uuid_1 = require("uuid");
const node_stream_1 = require("node:stream");
const path_1 = __importDefault(require("path"));
const web_worker_1 = __importDefault(require("web-worker"));
require("dotenv/config");
exports.readStreamEsp32CamSecurityGateImg = new node_stream_1.Readable({
    read() { },
});
const transformInfo = {
    frameCount: 0,
    size: 0,
};
setInterval(() => {
    console.log({
        frame: transformInfo.frameCount / 10 + "FPS",
        size: parseFloat(transformInfo.size / 1024 / 1024 + "").toFixed(2) + "Mb",
        speedAvg: parseFloat(transformInfo.size / 10 / 1024 + "").toFixed(2) + "Kbps",
    });
    transformInfo.frameCount = 0;
    transformInfo.size = 0;
}, 10000);
function setupWebsocket(wss, HOST, PORT) {
    wss.on("connection", function connection(ws, req) {
        const { query } = url_1.default.parse(req.url, true);
        let source = query.source || ws_enum_1.WebSocketSourceEnum.INVALID_SOURCE;
        if (Array.isArray(source))
            source = source[0];
        ws.id = (0, uuid_1.v4)();
        ws.source = source;
        console.log(`Client ${ws.id} connected`);
        ws.on("error", console.error);
        const worker = new web_worker_1.default(path_1.default.join(__dirname, "./workers/face-detection.worker.ts"), import.meta.url);
        worker.addEventListener("message", (e) => {
            console.log(e.data);
        });
        worker.postMessage(123);
        switch (ws.source) {
            case ws_enum_1.WebSocketSourceEnum.ESP32CAM_SECURITY_GATE_SEND_IMG:
                ws.once("message", (buffer) => __awaiter(this, void 0, void 0, function* () {
                    const { ffmpegCommand } = yield Promise.resolve().then(() => __importStar(require("./ffmpeg.service")));
                    ffmpegCommand.run();
                }));
                // Handle append video frames to stream
                ws.on("message", function message(buffer) {
                    return __awaiter(this, void 0, void 0, function* () {
                        transformInfo.frameCount++;
                        transformInfo.size += buffer.byteLength;
                        exports.readStreamEsp32CamSecurityGateImg.push(buffer);
                    });
                });
                break;
            default:
                console.log("Source is not valid!");
                ws.close();
        }
    });
    wss.on("listening", () => {
        console.log(`WebSocket Server is listening on ws://${HOST}:${PORT}`);
    });
    wss.on("error", console.log);
    wss.on("close", () => {
        console.log("Websocket is closed!");
    });
}
