"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertObjectConfigToString = exports.handleError = exports.handleEnd = exports.handleProgress = exports.handleCodecData = exports.handleStart = void 0;
const handleStart = (cmd) => {
    console.log(cmd);
    console.log("Ffmpeg is started with output: " + cmd.split(" ").at(-1));
};
exports.handleStart = handleStart;
const handleCodecData = ({ format, video_details, }) => {
    console.log(`Encode started: format(${format}), resolution(${video_details[3]}), fps(${video_details[4]})`);
};
exports.handleCodecData = handleCodecData;
const handleProgress = ({ frames, timemark, targetSize, }) => {
    console.log(`Progress: frames(${frames}), timemark(${timemark}), targetSize(${parseFloat((targetSize / 1024).toString()).toFixed(2)}Mb)`);
};
exports.handleProgress = handleProgress;
const handleEnd = () => console.log("Finished");
exports.handleEnd = handleEnd;
const handleError = (error) => console.log(`Encoding Error: ${error.message}`);
exports.handleError = handleError;
const convertObjectConfigToString = (config, symbol, separateSymbol) => {
    let result = "";
    const configArr = Object.getOwnPropertyNames(config);
    configArr.forEach((property, index) => {
        result += property + symbol + config[property];
        if (index < configArr.length - 1)
            result += separateSymbol;
    });
    return result;
};
exports.convertObjectConfigToString = convertObjectConfigToString;
