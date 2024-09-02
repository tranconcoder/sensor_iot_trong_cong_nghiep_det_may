import type { FsTemp, HTMLCanvasElementCustom } from "../../types/worker.d";

import fs from "fs";
import path from "path";
import * as faceApi from "face-api.js";
import {
    canvas,
    faceDetectionOptions,
    saveFile,
} from "../../config/face-api.js";
import { loadModels } from "../../utils/faceApiJs.util";
import { createCanvas } from "face-api.js";

let initialize = false;
let fsTemp: FsTemp;

addEventListener("message", async (e: MessageEvent<Buffer>) => {
    if (!initialize) {
        fsTemp = await import("fs-temp");
        await loadModels();
        initialize = true;
    }

    const imgPath = fsTemp.writeFileSync(e.data);
    const img = (await canvas.loadImage(imgPath)) as any as HTMLImageElement;
    // Create canvas
    const canvasElm = createCanvas({
        width: img.height,
        height: img.width,
    }) as HTMLCanvasElementCustom;

    // Rotate and flip horizontal image
    const canvasContext = canvasElm.getContext("2d");
    canvasContext?.save();
    canvasContext?.translate(img.height, 0);
    canvasContext?.scale(-1, 1);
    canvasContext?.translate(img.height / 2, img.width / 2);
    canvasContext?.rotate((270 * Math.PI) / 180);
    canvasContext?.drawImage(img, -img.width / 2, -img.height / 2);
    canvasContext?.restore();

    const detections = await faceApi.detectAllFaces(
        canvasElm,
        faceDetectionOptions
    );

    faceApi.draw.drawDetections(canvasElm, detections);

    postMessage(canvasElm.toBuffer("image/jpeg"));

    // Cleanup temporary file
    fs.rmSync(imgPath);
});
