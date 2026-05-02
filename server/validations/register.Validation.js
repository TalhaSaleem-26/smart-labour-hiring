import Joi from "joi";

export const registerValidation = (data) => {
  return Joi.object({
    name: Joi.string().min(3).required(),
    
    email: Joi.string()
      .email()
      .required(),

    password: Joi.string()
      .min(6)
      .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)"))
      .required(),

    phone: Joi.string()
      .pattern(/^\d{10,15}$/),

    role: Joi.string()
      .valid("admin", "worker", "employer"),
  }).validate(data);
};