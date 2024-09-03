import { Router } from "express";
import { RequestPayloadInvalidError } from "../config/handleError.config";
import upload from "../config/multer.config";

const employeeRouter = Router();

employeeRouter.post(
    "/upload-face",
    upload.array("face-img", 10),
    async (req, res, next) => {
        console.log(123);
        if (!req.files?.length) {
            next(new RequestPayloadInvalidError("Not found file upload!"));
            return;
        }

        const files = req.files as Array<Express.Multer.File>;
        console.log(files);

        res.json({name: "tranCon"})
    }
);

export default employeeRouter;
