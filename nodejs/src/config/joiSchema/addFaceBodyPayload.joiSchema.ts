import Joi from "joi";

const addFaceBodyPayload = Joi.object({
    label: Joi.string().hex().length(24),
});

export default addFaceBodyPayload
