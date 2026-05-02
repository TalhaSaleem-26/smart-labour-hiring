import Joi from "joi";

export const workerRegisterValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().max(100).optional(),

    bio: Joi.string().trim().max(500).optional(),

    skills: Joi.array()
      .items(Joi.string().trim())
      .min(1)
      .required()
      .messages({
        "array.min":    "At least one skill is required.",
        "any.required": "Skills are required.",
      }),

    category: Joi.string()
      .valid(
        "plumber", "electrician", "painter",
        "cleaner", "carpenter", "welder",
        "mason", "driver", "gardener", "other"
      )
      .required()
      .messages({
        "any.only":     "Please select a valid category.",
        "any.required": "Category is required.",
      }),

    experience: Joi.number().min(0).max(50).optional().messages({
      "number.min": "Experience cannot be negative.",
      "number.max": "Experience cannot exceed 50 years.",
    }),

    location: Joi.object({
      city:    Joi.string().trim().required().messages({
        "any.required": "City is required.",
        "string.empty": "City cannot be empty.",
      }),
      area:    Joi.string().trim().optional().allow(""),
      address: Joi.string().trim().optional().allow(""),
    }).required().messages({
      "any.required": "Location is required.",
    }),

    availability: Joi.object({
      days: Joi.array()
        .items(Joi.string().valid(
          "monday", "tuesday", "wednesday",
          "thursday", "friday", "saturday", "sunday"
        ))
        .min(1)
        .optional()
        .messages({
          "array.min": "Select at least one available day.",
        }),
      startTime: Joi.string().optional().allow(""),
      endTime:   Joi.string().optional().allow(""),
    }).optional(),

    hourlyRate: Joi.number().min(1).required().messages({
      "number.min":   "Hourly rate must be greater than 0.",
      "any.required": "Hourly rate is required.",
    }),

    cnic: Joi.string()
      .pattern(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "CNIC format must be: 00000-0000000-0",
      }),
  });

  // ✅ allowUnknown + stripUnknown — _id, __v, user, status etc ignore honge
  return schema.validate(data, {
    abortEarly:   true,
    allowUnknown: true,
    stripUnknown: true,
  });
};

export const workerUpdateValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().max(100).optional(),

    bio: Joi.string().trim().max(500).optional(),

    skills: Joi.array()
      .items(Joi.string().trim())
      .min(1)
      .optional()
      .messages({
        "array.min": "At least one skill is required.",
      }),

    category: Joi.string()
      .valid(
        "plumber", "electrician", "painter",
        "cleaner", "carpenter", "welder",
        "mason", "driver", "gardener", "other"
      )
      .optional()
      .messages({
        "any.only": "Please select a valid category.",
      }),

    experience: Joi.number().min(0).max(50).optional().messages({
      "number.min": "Experience cannot be negative.",
      "number.max": "Experience cannot exceed 50 years.",
    }),

    location: Joi.object({
      city:    Joi.string().trim().optional().allow(""),
      area:    Joi.string().trim().optional().allow(""),
      address: Joi.string().trim().optional().allow(""),
    }).optional(),

    availability: Joi.object({
      days: Joi.array()
        .items(Joi.string().valid(
          "monday", "tuesday", "wednesday",
          "thursday", "friday", "saturday", "sunday"
        ))
        .optional(),
      startTime: Joi.string().optional().allow(""),
      endTime:   Joi.string().optional().allow(""),
    }).optional(),

    hourlyRate: Joi.number().min(1).optional().messages({
      "number.min": "Hourly rate must be greater than 0.",
    }),

    cnic: Joi.string()
      .pattern(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "CNIC format must be: 00000-0000000-0",
      }),
  });

  
  return schema.validate(data, {
    abortEarly:   true,
    allowUnknown: true,
    stripUnknown: true,
  });
};