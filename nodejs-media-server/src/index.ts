import NodeMediaServer from 'node-media-server';

const chunkTime = 5;
const nmsFfmpeg = new NodeMediaServer({
	rtmp: {
		port: 1935,
		chunk_size: 60 * 1024,
		gop_cache: false,
		ping: 30,
		ping_timeout: 60,
	},
	http: {
		port: 8000,
		mediaroot: './media',
		allow_origin: '*',
	},
	trans: {
		ffmpeg: '/usr/bin/ffmpeg',
		tasks: [
			{
				app: 'live',
				vc: 'copy',
				hls: true,
				hlsFlags: `[hls_time=${chunkTime}:hls_list_size=${
					24 * 60 * (60 / chunkTime) // 24h
				}:hls_flags=append_list]`,
				hlsKeep: true,
				dash: true,
				dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
				dashKeep: true,
			} as any,
		],
	},
});

nmsFfmpeg.run();
