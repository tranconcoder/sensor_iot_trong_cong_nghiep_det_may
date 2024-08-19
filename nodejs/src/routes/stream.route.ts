import fs, { createReadStream } from 'fs';
import path from 'path';
import { Router } from 'express';

const streamRouter = Router();
streamRouter.get('/security-gate-cam', (req, res, next) => {
	const videoPath = path.join(
		__dirname,
		'../assets/videos/esp32_security_gate_cam/security_gate_190824_13_13_34.mp4'
	);
	const videoSize = fs.statSync(videoPath).size;
	const chunkSize = 1 * 1e6;
	const start = Number((req.headers.range || '').replace(/\D/g, ''));
	const end = start + chunkSize;
	const contentLength = end - start + 1;
	console.log(`Range: ${start}-${end}, Content-Length: ${videoSize}`);

	const headers = {
		'Content-Range': `bytes ${start}-${end}/${videoSize}`,
		'Accept-Ranges': 'bytes',
		'Content-Length': contentLength,
		'Content-Type': 'video/mp4',
	};

	res.writeHead(206, headers);
	const readStream = createReadStream(
		path.join(__dirname, '../public/videos/output.mp4'),
		{ start, end }
	);
	readStream.pipe(res);
});

export default streamRouter;
