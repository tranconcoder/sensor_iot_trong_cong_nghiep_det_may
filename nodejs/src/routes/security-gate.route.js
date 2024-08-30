import { Router } from "express";
import SecurityGateController from "../controllers/securityGate.controller";
const securityGateRouter = Router();
const securityGateController = new SecurityGateController();
securityGateRouter.post("/auth-serial-number", securityGateController.authSerialNumber);
export default securityGateRouter;
