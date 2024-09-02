import path from "path";
import * as faceApi from "face-api.js";
import {
    canvas,
    faceDetectionNet,
    faceDetectionOptions,
    saveFile,
} from "../config/face-api.js";
import { HTMLCanvasElementCustom } from "../types/worker.js";

let initialize = false;

export async function loadModels() {
    if (initialize) {
        console.log("Models was initialized!");
        return;
    }
    const weightDirectory = path.join(__dirname, "../assets/weights");
    await faceDetectionNet.loadFromDisk(weightDirectory);
    await faceApi.nets.faceLandmark68Net.loadFromDisk(weightDirectory);
    await faceApi.nets.ssdMobilenetv1.loadFromDisk(weightDirectory);
    await faceApi.nets.tinyFaceDetector.loadFromDisk(weightDirectory);

    initialize = true;
    console.log("FaceApiJs Models initialize successfully!");
}

export async function addFace(imageList: Array<string>, label: string) {
    const imgElmList: Array<HTMLImageElement> = await Promise.all(
        imageList.map((img) => canvas.loadImage(img))
    );

    const detectionsList = await Promise.all(
        imgElmList.map((imgElm) =>
            faceApi
                .detectAllFaces(imgElm, faceDetectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptors()
        )
    ).then((canvasResultList) => {
        return canvasResultList.map((faceList) =>
            faceList.map((detections) => detections.detection)
        );
    });

    const out = faceApi.createCanvasFromMedia(
        imgElmList[0]
    ) as HTMLCanvasElementCustom;
    faceApi.draw.drawDetections(out, detectionsList[0]);

    saveFile("123.jpeg", out.toBuffer("image/jpeg"));
}
