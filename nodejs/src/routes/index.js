import apiRouter from "./api.route";
import viewsRouter from "./views.route";
export default function handleRoute(app) {
    app.use("/api", apiRouter);
    app.use("/views", viewsRouter);
}
