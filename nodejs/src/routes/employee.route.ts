import { Router } from "express";
import { RequestPayloadInvalidError } from "../config/handleError.config";
import upload from "../config/multer.config";

const employeeRouter = Router();

employeeRouter.post(
    "/upload-face",
    upload.array("face-img", 10),
    async (req, res, next) => {
        if (!req.files?.length || !req.body.label) {
            next(new RequestPayloadInvalidError("Not found file upload!"));
            return;
        }

        const files = req.files as Array<Express.Multer.File>;
        const imgPathList = files.map((file) => file.path);

        res.json({ files, body: req.body });
    }
);

export default employeeRouter;
