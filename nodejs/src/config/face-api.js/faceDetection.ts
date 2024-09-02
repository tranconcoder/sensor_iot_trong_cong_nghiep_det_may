import * as faceapi from "face-api.js";

export const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
// export const faceDetectionNet = faceapi.nets.tinyFaceDetector;

// SsdMobilenetv1Options
const minConfidence = 0.5;

// TinyFaceDetectorOptions
const inputSize = 320;
const scoreThreshold = 0.7;

function getFaceDetectorOptions(net: faceapi.NeuralNetwork<any>) {
    return net === (faceapi.nets.ssdMobilenetv1 as any)
        ? new faceapi.SsdMobilenetv1Options({ minConfidence, maxResults: 1 })
        : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

export const faceDetectionOptions = getFaceDetectorOptions(
    faceDetectionNet as any
);
