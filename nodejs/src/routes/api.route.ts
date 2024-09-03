import { Router } from "express";
import securityGateRouter from "./security-gate.route";
import employeeRouter from "./employee.route";

const apiRouter = Router();

apiRouter.use("/security-gate", securityGateRouter);
apiRouter.use("/employee", employeeRouter)

export default apiRouter;
