import "/public/scripts/stream-cam-flv/flv.min.js";

if (flvjs.isSupported()) {
    const videoElement = document.getElementById("my-video");
    const flvPlayer = flvjs.createPlayer({
        type: "flv",
        url: "http://192.168.1.88:8000/live/livestream0.flv",
        isLive: true,
    });
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();
}
