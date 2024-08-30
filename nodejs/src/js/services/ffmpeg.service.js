"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ffmpegCommand = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const websocket_service_1 = require("./websocket.service");
const ffmpeg_util_1 = require("../utils/ffmpeg.util");
const ffmpeg_config_1 = require("../config/ffmpeg.config");
const videoFilterConfig = {
    text: "%{localtime}",
    fontcolor: ffmpeg_config_1.DRAWTEXT_COLOR,
    fontfile: ffmpeg_config_1.DRAWTEXT_FONTPATH,
    fontsize: ffmpeg_config_1.FONTSIZE,
    x: ffmpeg_config_1.FRAME_PADDING_X,
    y: ffmpeg_config_1.FRAME_PADDING_Y,
};
const videoFilterConfig2 = Object.assign(Object.assign({}, videoFilterConfig), { text: "SecurityCam", get x() {
        return parseInt(ffmpeg_config_1.FRAMESIZE_WIDTH - ffmpeg_config_1.FONTSIZE * (19 / 30) * this.text.length + "");
    } });
exports.ffmpegCommand = (0, fluent_ffmpeg_1.default)({ priority: 0 })
    .input(websocket_service_1.readStreamEsp32CamSecurityGateImg)
    .inputOptions(["-display_rotation 90", "-re"])
    .withNativeFramerate()
    .withNoAudio()
    .withSize(ffmpeg_config_1.FRAMESIZE)
    .nativeFramerate()
    .outputOptions([
    "-preset ultrafast",
    "-c:v libx264",
    `-vf ` +
        `hflip,` +
        `drawtext=${(0, ffmpeg_util_1.convertObjectConfigToString)(videoFilterConfig, "=", ":")},` +
        `drawtext=${(0, ffmpeg_util_1.convertObjectConfigToString)(videoFilterConfig2, "=", ":")}`,
    "-b:v 2M",
    "-fps_mode auto",
    "-pix_fmt yuv420p",
    "-frame_drop_threshold -5.0",
    "-thread_queue_size 2M",
])
    .noAudio()
    .format("flv")
    .output("rtmp://192.168.1.88:1935/live/livestream0")
    .on("start", ffmpeg_util_1.handleStart)
    .on("codecData", ffmpeg_util_1.handleCodecData)
    .on("progress", ffmpeg_util_1.handleProgress)
    .on("end", ffmpeg_util_1.handleEnd)
    .on("error", ffmpeg_util_1.handleError);
