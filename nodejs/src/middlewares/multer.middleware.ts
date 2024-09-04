import upload from "../config/multer.config";

export const uploadFaceMiddleware = upload.array('face-img', 10)
