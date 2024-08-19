import { Router } from 'express';

const securityGateRouter = Router();

securityGateRouter.post('/auth-serial-number', (req, res) => {
	console.log(Number(req.body?.serial_number as string));
});
securityGateRouter.post('send-image', (req, res) => {});

export default securityGateRouter;
