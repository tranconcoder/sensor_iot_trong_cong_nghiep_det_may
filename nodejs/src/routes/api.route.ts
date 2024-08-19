import { Router } from 'express';
import securityGateRouter from './security-gate.route';

const apiRouter = Router();

apiRouter.use('/security-gate', securityGateRouter);

export default apiRouter;
