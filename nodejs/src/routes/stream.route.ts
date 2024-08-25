import fs, { createReadStream } from 'fs';
import path from 'path';
import { Router } from 'express';

const streamRouter = Router();
streamRouter.get('/security-gate-cam', (req, res, next) => {});

export default streamRouter;
