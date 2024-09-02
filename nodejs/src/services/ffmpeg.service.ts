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
import {
    DRAWTEXT_COLOR,
    DRAWTEXT_FONTPATH,
    FONTSIZE,
    FRAMESIZE,
    FRAMESIZE_WIDTH,
    FRAME_PADDING_X,
    FRAME_PADDING_Y,
} from "../config/ffmpeg.config";

const videoFilterConfig: ConfigFilterVideo = {
    text: "%{localtime}",
    fontcolor: DRAWTEXT_COLOR,
    fontfile: DRAWTEXT_FONTPATH,
    fontsize: FONTSIZE,
    x: FRAME_PADDING_X,
    y: FRAME_PADDING_Y,
};
const videoFilterConfig2 = {
    ...videoFilterConfig,
    text: "SecurityCam",
    get x() {
        return parseInt(
            FRAMESIZE_WIDTH - FONTSIZE * (19 / 30) * this.text.length + ""
        );
    },
} as ConfigFilterVideo;

export const ffmpegCommand = Ffmpeg({ priority: 0 })
    .input(readStreamEsp32CamSecurityGateImg)
    //.inputOptions(["-display_rotation 90", "-re"])
    .inputOptions(["-re"])
    .withNativeFramerate()
    .withNoAudio()
    .withSize(FRAMESIZE.split("x").reverse().join("x"))
    .nativeFramerate()
    .outputOptions([
        "-preset ultrafast",
        "-c:v libx264",
        `-vf ` +
            //`hflip,` +
            `drawtext=${convertObjectConfigToString(
                videoFilterConfig,
                "=",
                ":"
            )},` +
            `drawtext=${convertObjectConfigToString(
                videoFilterConfig2,
                "=",
                ":"
            )}`,
        "-b:v 2M",
        "-fps_mode auto",
        "-pix_fmt yuv420p",
        "-frame_drop_threshold -5.0",
        "-thread_queue_size 2M",
    ])
    .noAudio()
    .format("flv")
    .output("rtmp://192.168.1.88:1935/live/livestream0")
    .on("start", handleStart)
    .on("codecData", handleCodecData)
    .on("progress", handleProgress)
    .on("end", handleEnd)
    .on("error", handleError);
