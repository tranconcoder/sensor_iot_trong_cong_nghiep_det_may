"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
addEventListener("message", (e) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
