import type { FsTemp, HTMLCanvasElementCustom } from "../../types/worker.d";

import path from "path";
import fs from "fs";
import * as faceApi from "face-api.js";
import {
    canvas,
    faceDetectionNet,
    faceDetectionOptions,
} from "../../config/face-api.js";

let initDone = false;
let fsTemp: FsTemp;
const weightDirectory = path.join(__dirname, "../../assets/weights");

addEventListener("message", async (e: MessageEvent<Buffer>) => {
    if (!initDone) {
        fsTemp = await import("fs-temp");
        await faceDetectionNet.loadFromDisk(weightDirectory);
        await faceApi.nets.faceLandmark68Net.loadFromDisk(weightDirectory);

        initDone = true;
    }

    const imgPath = fsTemp.writeFileSync(e.data);
    const img = (await canvas.loadImage(imgPath)) as HTMLImageElement;
    const detections = await faceApi.detectAllFaces(img, faceDetectionOptions);
    const out = faceApi.createCanvasFromMedia(img) as HTMLCanvasElementCustom;

    faceApi.draw.drawDetections(out, detections);

    console.log(detections);

    postMessage(out.toBuffer("image/jpeg"));

    // Cleanup temporary file
    fs.rmSync(imgPath);
});
