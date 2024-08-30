"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const security_gate_route_1 = __importDefault(require("./security-gate.route"));
const apiRouter = (0, express_1.Router)();
apiRouter.use('/security-gate', security_gate_route_1.default);
exports.default = apiRouter;
