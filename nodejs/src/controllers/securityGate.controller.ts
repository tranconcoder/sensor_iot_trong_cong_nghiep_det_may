import type { Request, Response, NextFunction } from "express";

// Image processing
import sharp from "sharp";

// Validate
import authDoorSchema from "../config/joiSchema/authDoor.joiSchema";
import { RequestPayloadInvalidError } from "../config/handleError.config";
import { faceRecognition } from "../utils/faceApiJs.util";
import { FRAMESIZE_HEIGHT, FRAMESIZE_WIDTH } from "../config/ffmpeg.config";
import { v4 } from "uuid";

export default class SecurityGateController {
    public async authDoor(req: Request, res: Response, next: NextFunction) {
        try {
            const base64Img = await authDoorSchema
                .validateAsync(req.body)
                .catch(() => {
                    throw new RequestPayloadInvalidError(
                        "Body is invalid type base64!"
                    );
                });
            const buffer = Buffer.from(base64Img, "base64");
            const filePath = `/tmp/${v4()}.jpeg`;

            await sharp(buffer)
                .rotate(270)
                .resize(FRAMESIZE_WIDTH, FRAMESIZE_HEIGHT, {
                    fit: "contain",
                })
                .jpeg()
                .toFile(filePath);

            const recognitionResult = await faceRecognition(filePath);

            res.send({ recognitionResult});
        } catch (error) {
            next(error);
        }
    }
}
