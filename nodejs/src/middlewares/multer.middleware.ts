import {uploadFace} from "../config/multer.config";

export const uploadFaceMiddleware = uploadFace.array("face-img", 10);
