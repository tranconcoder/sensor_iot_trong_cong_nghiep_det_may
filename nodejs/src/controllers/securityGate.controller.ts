import type { Application, Request, Response, NextFunction } from "express";

// Image processing
import sharp from "sharp";

// Validate
import authDoorSchema from "../config/joiSchema/authDoor.joiSchema";
import { RequestPayloadInvalidError } from "../config/handleError.config";

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

            sharp(buffer).jpeg().toFile("./test.jpg");

            res.send("123");
        } catch (error) {
            next(error);
        }
    }
}
