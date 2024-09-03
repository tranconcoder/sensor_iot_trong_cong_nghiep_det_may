import type { AddFacePayload } from "../../types/worker";

import { loadModels, canvas } from "../../utils/faceApiJs.util";
import * as faceApi from "face-api.js";
import { FaceModel } from "../../config/database/schema/face.shema";

addEventListener("message", async (e: MessageEvent<AddFacePayload>) => {
    try {
        // Load models
        await loadModels();

        const { label, imgPathList } = e.data;

        // Load image link to image element list
        const imgElementList = await Promise.all(
            imgPathList.map((imgPath) => canvas.loadImage(imgPath))
        );

        // Detect face and get descriptor
        const descriptorList = (
            await Promise.all(
                imgElementList.map((imgElm) => {
                    return faceApi
                        .detectAllFaces(
                            imgElm,
                            new faceApi.SsdMobilenetv1Options({
                                minConfidence: 0.5,
                                maxResults: 1,
                            })
                        )
                        .withFaceLandmarks()
                        .withFaceDescriptors();
                })
            )
        ).map((imgResult) =>
            imgResult.map((detections) => detections.descriptor)
        );

        const createFace = new FaceModel({
            userId: label,
            descriptors: descriptorList,
        });

        await createFace.save();

        postMessage(true);
    } catch (error) {
        postMessage(false);

        console.log(error);
    }
});
