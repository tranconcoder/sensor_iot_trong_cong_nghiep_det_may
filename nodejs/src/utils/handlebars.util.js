import { readdirSync, existsSync, lstatSync } from 'fs';
import path from 'path';
const exHbsHelpers = {
    loadCss(view) {
        const viewFileName = view.split('/').at(-1);
        const cssDirPath = path.join(__dirname, `../../public/css/${viewFileName}`);
        let cssTags = '';
        if (existsSync(cssDirPath) && lstatSync(cssDirPath).isDirectory()) {
            const files = readdirSync(cssDirPath);
            files.forEach((file) => {
                if (file.endsWith('.css')) {
                    cssTags += `<link rel='stylesheet' href='/public/css/${file}' />\r\n`;
                }
            });
        }
        return cssTags;
    },
};
export default exHbsHelpers;
