import type { CanvasCustom } from "../types/canvas";
import type { ArrayNotEmpty } from "../types/array";

// Face recognition
import "@tensorflow/tfjs-node";
import path from "path";
import * as faceApi from "face-api.js";
import * as _canvas from "canvas";

// Database
import { FaceModel } from "../config/database/schema/face.shema";

// Config
import { MIN_CONFIDENCE, MIN_FACE_UPLOAD } from "../config/face-api.js";
import { RequestPayloadInvalidError } from "../config/handleError.config";

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
    await loadModels();

    // Load HTMLImageELement
    const imgElmList = await Promise.all(
        imgPathList.map((imgPath) => canvas.loadImage(imgPath))
    );

    // Detect face and get descriptor
    const descriptorList = await Promise.all(
        imgElmList.map((imgElm) => {
            return faceApi
                .detectSingleFace(
                    imgElm,
                    new faceApi.SsdMobilenetv1Options({
                        minConfidence: MIN_CONFIDENCE,
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();
        })
    );

    // Validate face count
    const faceCount = descriptorList.reduce((accumutalor, descriptor) => {
        return accumutalor + Number(!!descriptor);
    }, 0);
    console.log(faceCount);
    if (faceCount < MIN_FACE_UPLOAD) {
        throw new RequestPayloadInvalidError(
            `Not enough 3 faces to recognize, current is ${faceCount} face`
        );
    }

    // Save to mongoose
    const createFace = new FaceModel({
        userId: label,
        descriptors: descriptorList,
    });
    await createFace.save();

    return true;
}

export { canvas };
