"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.HOST = exports.httpServer = exports.wss = void 0;
// Express app
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const body_parser_1 = __importDefault(require("body-parser"));
// Handlebars
const path_1 = __importDefault(require("path"));
const handlebars_service_1 = __importDefault(require("./services/handlebars.service"));
// Http server
const http_1 = require("http");
// Websocket Server
const websocket_service_1 = __importDefault(require("./services/websocket.service"));
const ws_1 = require("ws");
// Morgan
const morgan_1 = __importDefault(require("morgan"));
// Mongoose
const mongoose_config_1 = __importDefault(require("./config/database/mongoose.config"));
require("dotenv/config");
// Constants
const HOST = process.env.HOST;
exports.HOST = HOST;
const PORT = Number(process.env.PORT) || 3001;
exports.PORT = PORT;
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
const wss = new ws_1.WebSocketServer({
    server: httpServer,
    host: HOST,
    maxPayload: 64 * 1024,
});
exports.wss = wss;
//
// MORGAN
//
app.use((0, morgan_1.default)("tiny"));
//
// BODY PARSER
//
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
//
// STATIC FILES
//
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
//
// HANDLEBARS
//
const setupExHbs = new handlebars_service_1.default(app);
setupExHbs.setup();
//
// HANDLE ROUTE
//
(0, routes_1.default)(app);
//
// SETUP WEBSOCKET
//
(0, websocket_service_1.default)(wss, HOST, PORT);
//
// ERROR HANDLER
//
function errorHandler(err, req, res, next) {
    if (res.headersSent)
        return next(err);
    res.status(500);
    res.render("error", { error: err });
}
app.use(errorHandler);
//
// START SERVER
//
httpServer.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
//
// MONGOOSE
//
(0, mongoose_config_1.default)()
    .then(() => {
    console.log("Connected to database!");
})
    .catch(() => {
    console.log("Connect fail to database!");
});
