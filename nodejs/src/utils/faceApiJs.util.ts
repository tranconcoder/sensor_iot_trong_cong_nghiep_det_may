import type { ArrayNotEmpty } from "../types/array";
import type { CanvasCustom } from "../types/canvas";

// Face recognition
import "@tensorflow/tfjs-node";
import path from "path";
import * as faceApi from "face-api.js";
import * as _canvas from "canvas";
import fs from "fs";

// Database
import { FaceModel } from "../config/database/schema/face.schema";

// Handle error
import { RequestPayloadInvalidError } from "../config/handleError.config";

// Config
import { MIN_CONFIDENCE, MIN_FACE_UPLOAD } from "../config/face-api.js";
import { FsTemp, HTMLCanvasElementCustom } from "../types/worker";

let fsTemp: FsTemp;
let initialize = false;
const canvas = _canvas as any as CanvasCustom;

export async function loadModels() {
    // Cancel while model is loaded
    if (initialize) {
        console.log("Models was initialized!");
        return;
    }

    fsTemp = await import("fs-temp");

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
    // Load HTMLImageELement
    const imgElmList = await Promise.all(
        imgPathList.map((imgPath) => canvas.loadImage(imgPath))
    );

    // Detect face and get descriptor
    const descriptorList = (
        await Promise.all(
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
        )
    )
        .map((x) => x?.descriptor)
        .filter((x) => x);

    // Validate face count
    const faceCount = descriptorList.reduce((accumulator, descriptor) => {
        return accumulator + Number(!!descriptor);
    }, 0);
    console.log(faceCount);
    if (faceCount < MIN_FACE_UPLOAD) {
        throw new RequestPayloadInvalidError(
            `Not enough 3 faces to recognize, current is ${faceCount} face`
        );
    }

    // Save to mongoose
    const createFace = new FaceModel({
        employee_id: label,
        descriptors: descriptorList,
    });
    await createFace.save();

    return true;
}

export async function faceRecognition(imgPath: string) {
    const allFace = await FaceModel.find().then((faceList) => {
        return faceList.map(({ employee_id: label, descriptors }) => {
            return {
                label,
                descriptors: descriptors.map(
                    (descriptor) => new Float32Array(Object.values(descriptor))
                ),
            };
        });
    });
    const faceLabel = await Promise.all(
        allFace.map(({ label, descriptors }) => {
            return new faceApi.LabeledFaceDescriptors(
                label as string,
                descriptors
            );
        })
    );
    console.log(faceLabel);

    // Create canvas
    const faceMatcher = new faceApi.FaceMatcher(allFace, 0.6);
    const img = (await canvas.loadImage(imgPath)) as any as HTMLImageElement;
    const canvasElm = canvas.createCanvas(
        img.height,
        img.width
    ) as any as HTMLCanvasElementCustom;


    const detections = await faceApi.detectAllFaces(
        canvasElm,
        new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5, maxResults: 1 })
    );

    // Cleanup temporary file
    fs.rmSync(imgPath);

    return detections;
}

export { canvas };
