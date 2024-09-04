import multer, { diskStorage, memoryStorage, Multer, Options } from "multer";
import path from "path";
import fs from "fs";
import { RequestPayloadInvalidError } from "./handleError.config";

const imageFileFilter: Options["fileFilter"] = (_, file, callback) => {
    const mimeTypeList = ["image/jpeg", "image/jpg", "image/png"];
    if (!mimeTypeList.includes(file.mimetype)) {
        callback(
            new RequestPayloadInvalidError("Mimetype not support!") as any,
            false
        );
        return;
    }

    callback(null, true);
};

const faceStorage = memoryStorage();

export const uploadFace = multer({
    storage: faceStorage,
    limits: {
        fileSize: 10 * 1024 ** 2, // 1Mb
    },
    fileFilter: imageFileFilter,
});

export const uploadRecognitionFace = multer({
    storage: memoryStorage(),
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 ** 2, // 1Mb
    },
});
