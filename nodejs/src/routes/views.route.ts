import { Router } from "express";

const viewsRouter = Router();

viewsRouter.get("/stream-cam-ffmpeg", (_, res) => {
    res.render("pages/stream-cam-ffmpeg");
});
viewsRouter.get("/stream-cam-flv", (_, res) => {
    res.render("pages/stream-cam-flv");
});
viewsRouter.get("/home", (_, res) => {
    res.render("pages/home-page");
});

export default viewsRouter;
