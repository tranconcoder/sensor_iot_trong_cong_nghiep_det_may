import Ffmpeg from "fluent-ffmpeg";
import { readStreamEsp32CamSecurityGateImg } from "./websocket.service";
import {
    convertObjectConfigToString,
    handleCodecData,
    handleEnd,
    handleError,
    handleProgress,
    handleStart,
} from "../utils/ffmpeg.util";
import { ConfigFilterVideo } from "../types/ffmpeg";
import { FRAMESIZES } from "../config/ffmpeg.config";

const FRAMESIZE = FRAMESIZES.HVGA;
const FRAME_PADDING_X = 8;
const FRAME_PADDING_Y = 8;

const videoFilterConfig: ConfigFilterVideo = {
    text: "%{localtime}",
    fontcolor: "white@1.0",
    fontfile: "/usr/local/share/fonts/Roboto-Regular.ttf",
    fontsize: 20,
    x: FRAME_PADDING_X,
    y: FRAME_PADDING_Y,
};

export const ffmpegCommand = Ffmpeg({ priority: 0 })
    .input(readStreamEsp32CamSecurityGateImg)
    .inputOptions(["-display_rotation 90", "-re"])
    .withNativeFramerate()
    .withNoAudio()
    .size(FRAMESIZE)
    .nativeFramerate()
    .outputOptions([
        "-preset ultrafast",
        "-c:v libx264",
        `-vf hflip,drawtext=${convertObjectConfigToString(
            videoFilterConfig,
            "=",
            ":"
        )}`,
        "-b:v 2M",
        "-fps_mode auto",
        "-pix_fmt yuv420p",
        "-frame_drop_threshold -5.0",
        "-thread_queue_size 8M",
    ])
    .noAudio()
    .format("flv")
    .output("rtmp://localhost:1935/live/livestream0")
    .on("start", handleStart)
    .on("codecData", handleCodecData)
    .on("progress", handleProgress)
    .on("end", handleEnd)
    .on("error", handleError);
