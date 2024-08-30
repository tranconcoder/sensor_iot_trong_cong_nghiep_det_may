"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const securityGate_controller_1 = __importDefault(require("../controllers/securityGate.controller"));
const securityGateRouter = (0, express_1.Router)();
const securityGateController = new securityGate_controller_1.default();
securityGateRouter.post("/auth-serial-number", securityGateController.authSerialNumber);
exports.default = securityGateRouter;
