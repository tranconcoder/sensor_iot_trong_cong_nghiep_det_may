import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const fullPath = path.join(__dirname, "../assets/images/");
        if (!fs.existsSync(fullPath))
            fs.mkdirSync(fullPath, { recursive: true });

        console.log(fullPath);

        cb(null, fullPath);
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

export default upload;
