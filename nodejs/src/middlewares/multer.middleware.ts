import { uploadFace, uploadRecognitionFace } from "../config/multer.config";

export const uploadFaceMiddleware = uploadFace.array("face-img", 20);

export const uploadRecognitionFaceMiddleware =
    uploadRecognitionFace.single("face-img");
