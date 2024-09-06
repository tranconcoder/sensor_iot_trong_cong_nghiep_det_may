import { uploadFace, uploadRecognitionFace } from "../config/multer.config";

export const uploadFaceMiddleware = uploadFace.array("face-img", 100);

export const uploadRecognitionFaceMiddleware =
    uploadRecognitionFace.single("face-img");
