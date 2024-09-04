// Express
import { Router } from "express";

// Middleware
import { uploadFaceMiddleware } from "../middlewares/multer.middleware";

// Controller
import EmployeeController from "../controllers/employee.controller";

const employeeRouter = Router();
const employeeController = new EmployeeController();

employeeRouter.post(
    "/upload-face",
    uploadFaceMiddleware,
    employeeController.uploadFace
);

export default employeeRouter;
