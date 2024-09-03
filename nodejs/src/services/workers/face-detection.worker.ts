import type { FsTemp, HTMLCanvasElementCustom } from "../../types/worker.d";

import fs from "fs";
import * as faceApi from "face-api.js";
import { canvas } from "../../utils/faceApiJs.util";
import { loadModels } from "../../utils/faceApiJs.util";

let initialize = false;
let fsTemp: FsTemp;
let i = 0;

addEventListener("message", async (e: MessageEvent<Buffer>) => {
    if (!initialize) {
        fsTemp = await import("fs-temp");
        await loadModels();
        initialize = true;
    }

    // Save buffer img to temp file
    const imgPath = fsTemp.writeFileSync(e.data);
    const img = (await canvas.loadImage(imgPath)) as any as HTMLImageElement;

    // Create canvas
    const canvasElm = canvas.createCanvas(
        img.height,
        img.width
    ) as any as HTMLCanvasElementCustom;

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
        new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5, maxResults: 1 })
    );

    postMessage(detections);

    // Cleanup temporary file
    fs.rmSync(imgPath);
});
