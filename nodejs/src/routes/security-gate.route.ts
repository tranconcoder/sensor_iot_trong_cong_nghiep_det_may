import { Router } from "express";
import SecurityGateController from "../controllers/securityGate.controller";

const securityGateRouter = Router();
const securityGateController = new SecurityGateController();

securityGateRouter.post("/auth-door", securityGateController.authDoor);

export default securityGateRouter;
