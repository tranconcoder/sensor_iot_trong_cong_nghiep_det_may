import type { Request } from 'express';
import type { WebSocketServer } from 'ws';
import type { WebSocket } from '../types/ws';

import { WebSocketSourceEnum } from '../enums/ws.enum';
import url from 'url';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'node:stream';

import 'dotenv/config';

export const readStreamEsp32CamSecurityGateImg = new Readable({
	read() {},
	destroy() {},
});

export default function setupWebsocket(
	wss: WebSocketServer,
	HOST: string,
	PORT: number
) {
	wss.on('connection', function connection(ws: WebSocket, req: Request) {
		const { query } = url.parse(req.url, true);
		let source = query.source || WebSocketSourceEnum.INVALID_SOURCE;
		if (Array.isArray(source)) source = source[0];

		ws.id = uuidv4();
		ws.source = source as string;
		console.log(`Client ${ws.id} connected`);
		ws.on('error', console.error);

		switch (ws.source) {
			case WebSocketSourceEnum.ESP32CAM_SECURITY_GATE_SEND_IMG:
				ws.once('message', () => {
					import('./ffmpeg.service');
				});

				// Handle append video frames to stream
				ws.on('message', function message(buffer: Buffer) {
					readStreamEsp32CamSecurityGateImg.push(buffer);
					console.log(
						`Received message from client ${ws.id}: ${buffer.byteLength} bytes`
					);
				});

				break;

			default:
				console.log('Source is not valid!');
				ws.close();
		}
	});

	wss.on('listening', () => {
		console.log(`WebSocket Server is listening on ws://${HOST}:${PORT}`);
	});

	wss.on('error', console.log);

	wss.on('close', () => {});
}
