import type { ErrorRequestHandler } from "express";
import { RequestError } from "../config/handleError.config";

export default (function handleError(error: RequestError, req, res, next) {
    console.log(error.toString());
} as ErrorRequestHandler);
