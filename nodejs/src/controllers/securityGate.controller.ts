import type { Request, Response, NextFunction } from "express";

// Image processing
import sharp from "sharp";

// Validate
import authDoorSchema from "../config/joiSchema/authDoor.joiSchema";
import { RequestPayloadInvalidError } from "../config/handleError.config";
import { FRAMESIZE_HEIGHT, FRAMESIZE_WIDTH } from "../config/ffmpeg.config";
import { v4 } from "uuid";

export default class SecurityGateController {
}
