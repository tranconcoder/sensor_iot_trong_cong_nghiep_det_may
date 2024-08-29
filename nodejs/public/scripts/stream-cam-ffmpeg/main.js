import "/public/scripts/stream-cam-ffmpeg/hls.min.js";

if (Hls.isSupported()) {
    const video = document.getElementById("my-video");
    const hls = new Hls();
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource("http://192.168.1.88:8000/live/livestream0/index.m3u8");
    });
    video.webkitRequestFullScreen();
}
video.play();
