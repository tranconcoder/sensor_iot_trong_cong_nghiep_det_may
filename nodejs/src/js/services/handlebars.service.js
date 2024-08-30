"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_handlebars_1 = require("express-handlebars");
const handlebars_util_1 = __importDefault(require("../utils/handlebars.util"));
class SetupHandlebars {
    constructor(app) {
        this.app = app;
        this.exHandlebars = (0, express_handlebars_1.create)({
            extname: '.hbs',
            helpers: handlebars_util_1.default,
        });
    }
    setup() {
        this.app.engine('.hbs', this.exHandlebars.engine);
        this.app.set('view engine', '.hbs');
        this.app.set('views', path_1.default.join(__dirname, '../views'));
    }
}
exports.default = SetupHandlebars;
