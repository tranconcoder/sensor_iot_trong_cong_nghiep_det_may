"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const exHbsHelpers = {
    loadCss(view) {
        const viewFileName = view.split('/').at(-1);
        const cssDirPath = path_1.default.join(__dirname, `../../public/css/${viewFileName}`);
        let cssTags = '';
        if ((0, fs_1.existsSync)(cssDirPath) && (0, fs_1.lstatSync)(cssDirPath).isDirectory()) {
            const files = (0, fs_1.readdirSync)(cssDirPath);
            files.forEach((file) => {
                if (file.endsWith('.css')) {
                    cssTags += `<link rel='stylesheet' href='/public/css/${file}' />\r\n`;
                }
            });
        }
        return cssTags;
    },
};
exports.default = exHbsHelpers;
