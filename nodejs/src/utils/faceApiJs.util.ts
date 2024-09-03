import path from "path";
import * as faceApi from "face-api.js";
import * as _canvas from "canvas";
import "@tensorflow/tfjs-node";
import { CanvasCustom } from "../types/canvas";

let initialize = false;
const canvas = _canvas as any as CanvasCustom;

export async function loadModels() {
    // Cancel while model is loaded
    if (initialize) {
        console.log("Models was initialized!");
        return;
    }

    // Apply canvas element type for nodejs
    const { Canvas, Image, ImageData } = canvas as any;
    faceApi.env.monkeyPatch({ Canvas, Image, ImageData });

    // Loading models
    const weightDirectory = path.join(__dirname, "../assets/weights");
    await faceApi.nets.ssdMobilenetv1.loadFromDisk(weightDirectory);
    await faceApi.nets.faceLandmark68Net.loadFromDisk(weightDirectory);
    await faceApi.nets.faceRecognitionNet.loadFromDisk(weightDirectory);

    // Set load successfully
    initialize = true;
    console.log("FaceApiJs Models initialize successfully!");
}

export { canvas };

export async function addFace(imageList: Array<string>, label: string) {
    // Load all image path to HTMLImageElement
    const imgElmList = await Promise.all(
        imageList.map((img) => canvas.loadImage(img) as any as HTMLImageElement)
    );

    // Detections all HTMLImageElement width descriptors
    const detectionsList = await Promise.all(
        imgElmList.map((imgElm) =>
            faceApi
                .detectAllFaces(
                    imgElm,
                    new faceApi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
                )
                .withFaceLandmarks()
                .withFaceDescriptors()
        )
    ).then((canvasResultList) => {
        return canvasResultList.map((faceList) =>
            faceList.map((detections) => detections.descriptor)
        );
    });
}
