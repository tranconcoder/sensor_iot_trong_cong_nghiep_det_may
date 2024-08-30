import * as faceDetection from "@tensorflow-models/face-detection";
import { MediaPipeFaceDetectorModelConfig } from "@tensorflow-models/face-detection/dist/mediapipe/types";
import * as canvas from "canvas";

addEventListener("message", async (e) => {
    console.log(e.data);
    /*
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig: MediaPipeFaceDetectorModelConfig = {
        runtime: "mediapipe", // or 'tfjs'
    };
    const detector = await faceDetection.createDetector(model, detectorConfig);
    const img = canvas.createImageData(1, 2) as ImageData;
    const faces = await detector.estimateFaces(img);
    */
});
