import type { ObjectAnyKey } from "../types/object";

export const handleStart = (cmd: string) => {
    console.log(cmd);
    console.log("Ffmpeg is started with output: " + cmd.split(" ").at(-1));
};
export const handleCodecData = ({
    format,
    video_details,
}: {
    format: string;
    video_details: string;
}) => {
    console.log(
        `Encode started: format(${format}), resolution(${video_details[3]}), fps(${video_details[4]})`
    );
};

export const handleProgress = ({
    frames,
    timemark,
    targetSize,
}: {
    frames: number;
    timemark: string;
    targetSize: number;
}) => {
    console.log(
        `Progress: frames(${frames}), timemark(${timemark}), targetSize(${parseFloat(
            (targetSize / 1024).toString()
        ).toFixed(2)}Mb)`
    );
};
export const handleEnd = () => console.log("Finished");
export const handleError = (error: any) =>
    console.log(`Encoding Error: ${error.message}`);

export const convertObjectConfigToString = (
    config: ObjectAnyKey<string | number, string>,
    symbol: string,
    separateSymbol: string
) => {
    let result = "";

    const configArr = Object.getOwnPropertyNames(config);

    configArr.forEach((property, index) => {
        result += property + symbol + config[property];
        if (index < configArr.length - 1) result += separateSymbol;
    });

    return result;
};
