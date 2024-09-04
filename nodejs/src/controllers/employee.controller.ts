import type { Request, Response, NextFunction } from "express";
import type { ArrayNotEmpty } from "../types/array";

// Validator
import addFaceBodyPayload from "../config/joiSchema/addFaceBodyPayload.joiSchema";
import {
    RequestError,
    RequestPayloadInvalidError,
} from "../config/handleError.config";

// Image processing
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import { FRAMESIZE_WIDTH, FRAMESIZE_HEIGHT } from "../config/ffmpeg.config";

// Face Api Js
import addFace, { faceRecognition } from "../utils/faceApiJs.util";

export default class EmployeeController {
    public async uploadFace(req: Request, res: Response, next: NextFunction) {
        try {
            const { label } = await addFaceBodyPayload
                .validateAsync(req.body)
                .catch(() => {
                    throw new RequestPayloadInvalidError(
                        "Body payload invalid"
                    );
                });

            const files = req.files as Array<Express.Multer.File>;

            // Create directory
            const dirPath = path.join(
                __dirname,
                `../assets/images/faces/${label}`
            );
            if (fs.existsSync(dirPath))
                fs.rmSync(dirPath, { recursive: true, force: true });
            fs.mkdirSync(dirPath, { recursive: true });

            // Write file list
            const filePathList = await Promise.all(
                files.map(({ buffer }) => {
                    const fileName = `${dirPath}/${v4()}.jpg`;

                    return sharp(buffer)
                        .rotate()
                        .resize(FRAMESIZE_WIDTH, FRAMESIZE_HEIGHT, {
                            fit: "contain",
                        })
                        .withMetadata()
                        .jpeg()
                        .toFile(fileName)
                        .then(() => fileName); // return filename to promise
                })
            );

            res.json(
                await addFace(filePathList as ArrayNotEmpty<string>, label)
            );
        } catch (error: any) {
            if (error instanceof RequestError) next(error);
            else {
                next(new RequestError(400, error?.message || "Unknown error!"));
            }
        }
    }

    public async uploadRecognitionFace(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const file = req.file as Express.Multer.File;
            const buffer = file?.buffer;
            const fileName = `/tmp/${v4()}`;
            const filePath = await sharp(buffer)
                .rotate()
                .resize(FRAMESIZE_WIDTH, FRAMESIZE_HEIGHT, {
                    fit: "contain",
                })
                .withMetadata()
                .jpeg()
                .toFile(fileName)
                .then(() => fileName); // return filename to promise
            const result = await faceRecognition(filePath);


            res.json({ result });

            fs.rmSync(fileName);
        } catch (error) {
            next(error);
        }
    }
}
