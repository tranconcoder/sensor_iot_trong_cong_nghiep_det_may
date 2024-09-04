import type { Request, Response, NextFunction } from "express";

// Validator
import addFaceBodyPayload from "../config/joiSchema/addFaceBodyPayload.joiSchema";
import {
    RequestError,
    RequestPayloadInvalidError,
} from "../config/handleError.config";
import { ArrayNotEmpty } from "../types/array";
import addFace from "../utils/faceApiJs.util";

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
            const imgPathList = files.map(
                (file) => file.path
            ) as ArrayNotEmpty<string>;

            res.json(await addFace(imgPathList, label));
        } catch (error: any) {
            if (error instanceof RequestError) next(error);
            else {
                next(new RequestError(400, error?.message || "Unknown error!"));
            }
        }
    }
}
