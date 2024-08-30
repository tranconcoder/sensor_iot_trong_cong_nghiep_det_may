"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const viewsRouter = (0, express_1.Router)();
viewsRouter.get('/stream-cam-ffmpeg', (_, res) => {
    res.render('pages/stream-cam-ffmpeg');
});
viewsRouter.get('/stream-cam-flv', (_, res) => {
    res.render('pages/stream-cam-flv');
});
exports.default = viewsRouter;
