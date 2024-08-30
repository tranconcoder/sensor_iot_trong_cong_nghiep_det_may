import path from 'path';
import { create } from 'express-handlebars';
import exHbsHelpers from '../utils/handlebars.util';
export default class SetupHandlebars {
    constructor(app) {
        this.app = app;
        this.exHandlebars = create({
            extname: '.hbs',
            helpers: exHbsHelpers,
        });
    }
    setup() {
        this.app.engine('.hbs', this.exHandlebars.engine);
        this.app.set('view engine', '.hbs');
        this.app.set('views', path.join(__dirname, '../views'));
    }
}
