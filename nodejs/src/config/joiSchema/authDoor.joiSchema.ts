import Joi from "joi";

const authDoorSchema = Joi.string().base64().required();

export default authDoorSchema;
