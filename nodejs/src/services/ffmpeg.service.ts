import { Application } from 'express';
import Ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { readStreamEsp32CamSecurityGateImg } from './websocket.service';
import { HEIGHT, INPUT_FPS, OUTPUT_FPS, WIDTH } from '../config/ffmpeg.config';

export const ffmpegCommand = Ffmpeg({ priority: 1 })
	.input(readStreamEsp32CamSecurityGateImg)
	.inputFps(INPUT_FPS)
	.size(`${WIDTH}x${HEIGHT}`)
	.videoCodec('libx264')
	.videoBitrate('4000k')
	.toFormat('mp4')
	.outputOptions(['-pix_fmt yuv420p'])
	.outputFps(OUTPUT_FPS)
	.on('start', () => console.log('Started'))
	.on('codecData', console.table)
	.on('progress', console.table)
	.saveToFile(path.join(__dirname, '../public/videos/output.mp4'));
