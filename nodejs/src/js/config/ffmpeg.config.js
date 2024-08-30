"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRAWTEXT_FONTPATH = exports.DRAWTEXT_COLOR = exports.LINE_MARGIN_SIZE = exports.FONTSIZE = exports.FRAME_PADDING_Y = exports.FRAME_PADDING_X = exports.FRAMESIZE_WIDTH = exports.FRAMESIZE_HEIGHT = exports.FRAMESIZE = exports.getEsp32CamSecurityGateSourcePath = exports.FRAMESIZES = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const date_fns_1 = require("date-fns");
exports.FRAMESIZES = {
    QCIF: "176x144",
    HQVGA: "240x176",
    _240X240: "240x240",
    QVGA: "320x240",
    CIF: "400x296",
    HVGA: "480x320",
    VGA: "640x480",
    SVGA: "800x600",
    XGA: "1024x768",
    HD: "1280x720",
};
const getEsp32CamSecurityGateSourcePath = () => {
    const directoryPath = path_1.default.join(__dirname, `../assets/videos/esp32_security_gate_cam/`);
    const timestamp = (0, date_fns_1.format)(new Date(), "ddMMyy_HH_mm_ss");
    if (!fs_1.default.existsSync(directoryPath))
        fs_1.default.mkdirSync(directoryPath, { recursive: true });
    return path_1.default.join(directoryPath, `security_gate_${timestamp}.mp4`);
};
exports.getEsp32CamSecurityGateSourcePath = getEsp32CamSecurityGateSourcePath;
exports.FRAMESIZE = exports.FRAMESIZES.VGA;
_a = exports.FRAMESIZE.split("x").map((x) => Number(x)), exports.FRAMESIZE_HEIGHT = _a[0], exports.FRAMESIZE_WIDTH = _a[1];
exports.FRAME_PADDING_X = 10;
exports.FRAME_PADDING_Y = 10;
exports.FONTSIZE = 22;
exports.LINE_MARGIN_SIZE = 3;
exports.DRAWTEXT_COLOR = "white@0.5";
exports.DRAWTEXT_FONTPATH = path_1.default.join(__dirname, "../assets/fonts/CaskaydiaCoveNerdFontMono-Regular.ttf");
