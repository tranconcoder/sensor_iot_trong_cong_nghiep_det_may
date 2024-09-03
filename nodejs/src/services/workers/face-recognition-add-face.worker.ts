import type { AddFacePayload } from "../../types/worker";
import { loadModels, canvas } from "../../utils/faceApiJs.util";

addEventListener("message", async (e: MessageEvent<AddFacePayload>) => {
    // Load models
    await loadModels();

    // Load image link to image element list
    const imageElementList = await Promise.all(
        e.data.map((imgPath) => canvas.loadImage(imgPath))
    );
});
