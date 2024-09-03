import multer from "multer";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "/tmp/my-uploads");
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

export default upload;
