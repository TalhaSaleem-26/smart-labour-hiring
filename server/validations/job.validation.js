import Joi from "joi";

export const jobCreateValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().max(100).required().messages({
      "string.empty": "Job title is required.",
      "string.max":   "Title cannot exceed 100 characters.",
      "any.required": "Job title is required.",
    }),

    description: Joi.string().trim().max(2000).required().messages({
      "string.empty": "Job description is required.",
      "string.max":   "Description cannot exceed 2000 characters.",
      "any.required": "Job description is required.",
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

    skillsRequired: Joi.array()
      .items(Joi.string().trim())
      .optional(),

    location: Joi.object({
      city: Joi.string().trim().required().messages({
        "string.empty": "City is required.",
        "any.required": "City is required.",
      }),
      area:    Joi.string().trim().optional().allow(""),
      address: Joi.string().trim().optional().allow(""),
      coordinates: Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional(),
      }).optional(),
    }).required().messages({
      "any.required": "Location is required.",
    }),

    budget: Joi.number().min(1).required().messages({
      "number.base":  "Budget must be a number.",
      "number.min":   "Budget must be greater than 0.",
      "any.required": "Budget is required.",
    }),

    paymentType: Joi.string()
      .valid("hourly", "fixed", "daily")
      .optional()
      .messages({
        "any.only": "Payment type must be hourly, fixed, or daily.",
      }),

    duration: Joi.string().trim().optional().allow(""),

    deadline: Joi.date().greater("now").optional().messages({
      "date.greater": "Deadline must be a future date.",
    }),

    jobType: Joi.string()
      .valid("full-time", "part-time", "contract", "one-time")
      .optional()
      .messages({
        "any.only": "Invalid job type.",
      }),

    experienceRequired: Joi.number().min(0).optional().messages({
      "number.min": "Experience cannot be negative.",
    }),
  });

  return schema.validate(data, {
    abortEarly:   true,
    allowUnknown: true,
    stripUnknown: true,
  });
};

export const jobUpdateValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().max(100).optional().messages({
      "string.max": "Title cannot exceed 100 characters.",
    }),

    description: Joi.string().trim().max(2000).optional().messages({
      "string.max": "Description cannot exceed 2000 characters.",
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

    skillsRequired: Joi.array()
      .items(Joi.string().trim())
      .optional(),

    location: Joi.object({
      city:    Joi.string().trim().optional().allow(""),
      area:    Joi.string().trim().optional().allow(""),
      address: Joi.string().trim().optional().allow(""),
      coordinates: Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional(),
      }).optional(),
    }).optional(),

    budget: Joi.number().min(1).optional().messages({
      "number.min": "Budget must be greater than 0.",
    }),

    paymentType: Joi.string()
      .valid("hourly", "fixed", "daily")
      .optional(),

    duration: Joi.string().trim().optional().allow(""),

    deadline: Joi.date().optional(),

    jobType: Joi.string()
      .valid("full-time", "part-time", "contract", "one-time")
      .optional(),

    status: Joi.string()
      .valid("open", "closed", "hired")
      .optional(),

    experienceRequired: Joi.number().min(0).optional(),
  });

  return schema.validate(data, {
    abortEarly:   true,
    allowUnknown: true,
    stripUnknown: true,
  });
};

export const jobApplyValidation = (data) => {
  const schema = Joi.object({
    coverLetter: Joi.string().trim().max(500).optional().allow("").messages({
      "string.max": "Cover letter cannot exceed 500 characters.",
    }),
  });

  return schema.validate(data, {
    abortEarly:   true,
    allowUnknown: true,
    stripUnknown: true,
  });
};