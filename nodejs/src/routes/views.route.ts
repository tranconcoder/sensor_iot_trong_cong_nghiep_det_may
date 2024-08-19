import { Router } from 'express';

const viewsRouter = Router();

viewsRouter.get('/stream-image', (req, res) => {
	res.render('pages/stream-image');
});

export default viewsRouter;
