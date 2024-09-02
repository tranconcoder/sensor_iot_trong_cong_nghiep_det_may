import * as faceapi from "face-api.js";

export const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
// export const faceDetectionNet = faceapi.nets.faceLandmark68TinyNet;

// SsdMobilenetv1Options
const minConfidence = 0.1;

// TinyFaceDetectorOptions
const inputSize = 640;
const scoreThreshold = 0.1;

function getFaceDetectorOptions(net: faceapi.NeuralNetwork<any>) {
    return net === (faceapi.nets.ssdMobilenetv1 as any)
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

export const faceDetectionOptions = getFaceDetectorOptions(
    faceDetectionNet as any
);
