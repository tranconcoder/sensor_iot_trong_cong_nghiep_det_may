import '/public/scripts/stream-cam-flv/flv.min.js';

if (flvjs.isSupported()) {
	const videoElement = document.getElementById('my-video');
	const flvPlayer = flvjs.createPlayer({
		type: 'flv',
		url: 'ws://192.168.1.88:8000/live/livestream0.flv',
	});
	flvPlayer.attachMediaElement(videoElement);
	flvPlayer.load();
	flvPlayer.play();
}
