import type { Request, Response, NextFunction } from 'express';

// Express app
import express from 'express';
import handleRoute from './routes';
import bodyParser from 'body-parser';

// Handlebars
import { engine } from 'express-handlebars';
import path from 'path';

// Http server
import { createServer } from 'http';
import ip from 'ip';

// Websocket Server
import setupWebsocket from './services/websocket.service';
import { WebSocketServer } from 'ws';

// ffmpeg

import 'dotenv/config';

// Constants
const HOST = (process.env.HOST as string) || ip.address();
const PORT = Number(process.env.PORT) || 3001;

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({
	server: httpServer,
	host: HOST,
	maxPayload: 128 * 1024,
});

//
// BODY PARSER
//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//
// STATIC FILES
//
app.use('/public', express.static(path.join(__dirname, './public')));

//
// HANDLEBARS
//
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, './views'));

//
// HANDLE ROUTE
//
handleRoute(app);

//
// SETUP WEBSOCKET
//
setupWebsocket(wss, HOST, PORT);

//
// SETUP FFMPEG
//

//
// ERROR HANDLER
//
function errorHandler(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (res.headersSent) return next(err);

	res.status(500);
	res.render('error', { error: err });
}
app.use(errorHandler);

//
// START SERVER
//
httpServer.listen(PORT, HOST, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);
});

export { wss, httpServer, HOST, PORT };
