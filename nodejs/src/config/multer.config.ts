import multer from "multer";
import path from "path";
import fs from "fs";
import { RequestPayloadInvalidError } from "./handleError.config";

export const faceStorage = multer.diskStorage({
    destination(req, file, cb) {
        const fullPath = path.join(__dirname, "../assets/images/");
        if (!fs.existsSync(fullPath))
            fs.mkdirSync(fullPath, { recursive: true });

        cb(null, fullPath);
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                "." +
                file.mimetype?.split("/")[1]
        );
    },
});

export const uploadFace = multer({
    storage: faceStorage,
    limits: {
        fileSize: 1 * 1024 ** 2, // 1Mb
    },
    fileFilter(req, file, callback) {
        const mimeTypeList = ["image/jpeg", "image/jpg", "image/png"];
        if (!mimeTypeList.includes(file.mimetype)) {
            callback(
                new RequestPayloadInvalidError("Mimetype not support!") as any,
                false
            );
            return;
        }

        callback(null, true);
    },
});
