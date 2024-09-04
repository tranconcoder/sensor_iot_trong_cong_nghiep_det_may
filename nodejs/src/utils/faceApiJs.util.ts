import path from "path";
import * as faceApi from "face-api.js";
import * as _canvas from "canvas";
import "@tensorflow/tfjs-node";
import { CanvasCustom } from "../types/canvas";
import { ArrayNotEmpty } from "../types/array";
import { FaceModel } from "../config/database/schema/face.shema";

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

export default async function addFace(
    imgPathList: ArrayNotEmpty<string>,
    label: string
) {
    await loadModels()

    const imgElmList = await Promise.all(
        imgPathList.map((imgPath) => canvas.loadImage(imgPath))
    );

    const descriptorList = (
        await Promise.all(
            imgElmList.map((imgElm) => {
                return faceApi
                    .detectAllFaces(
                        imgElm,
                        new faceApi.SsdMobilenetv1Options({
                            minConfidence: 0.9,
                            maxResults: 1,
                        })
                    )
                    .withFaceLandmarks()
                    .withFaceDescriptors();
            })
        )
    ).map((imgResult) => imgResult.map((detections) => detections.descriptor));

    const createFace = new FaceModel({
        userId: label,
        descriptors: descriptorList,
    });

    await createFace.save();

    return true;
}

export { canvas };
