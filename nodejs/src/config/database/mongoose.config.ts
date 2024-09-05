import mongoose from "mongoose";
import "dotenv/config";

const PASSWORD = process.env.MONGODB_ATLAS_PASSWORD;

export default function connectDb() {
    return mongoose.connect(
        `mongodb+srv://tranconcoder:${PASSWORD}@cluster0.vdsy1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
}
