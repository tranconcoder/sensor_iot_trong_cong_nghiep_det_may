"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDb;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const PASSWORD = process.env.MONGODB_ATLAS_PASSWORD;
console.log({ PASSWORD });
function connectDb() {
    return mongoose_1.default.connect(`mongodb+srv://tranconcoder:${PASSWORD}@cluster0.vdsy1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
}
