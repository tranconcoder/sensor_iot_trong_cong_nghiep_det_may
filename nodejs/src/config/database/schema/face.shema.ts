import mongoose from "mongoose";
const { Schema } = mongoose;

const faceSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        unique: true,
    },
    descriptors: {
        type: Array,
        required: true,
    },
});

export const FaceModel = mongoose.model("Face", faceSchema);
