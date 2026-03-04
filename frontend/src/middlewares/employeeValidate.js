import Joi from "joi";

export const validateEmployee = (req, res, next) => {
  const schema = Joi.object({
    full_name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    role: Joi.string().valid("SM","SUP","CREW","CREW_TRAINER","CREW_LEADER","HQ"),
    type: Joi.string().valid("part-time","full-time"),
    base_salary: Joi.number().when("type", { is: "full-time", then: Joi.required(), otherwise: Joi.forbidden() }),
    hourly_rate: Joi.number().when("type", { is: "part-time", then: Joi.required(), otherwise: Joi.forbidden() }),
    contract_end: Joi.date().optional(),
    active: Joi.boolean().optional().default(true)
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

export const validateEmployeeUpdate = (req, res, next) => {
  const schema = Joi.object({
    full_name: Joi.string().optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    role: Joi.string().valid("SM","SUP","CREW","CREW_TRAINER","CREW_LEADER","HQ").optional(),
    type: Joi.string().valid("part-time","full-time").optional(),

    base_salary: Joi.number().allow(null),
    hourly_rate: Joi.number().allow(null),

    contract_end: Joi.date().allow(null),
    active: Joi.boolean().optional()
  })
  .custom((value, helpers) => {
    if (value.type === "full-time" && !value.base_salary) {
      return helpers.error("any.custom", "Full-time phải có base_salary");
    }
    if (value.type === "part-time" && !value.hourly_rate) {
      return helpers.error("any.custom", "Part-time phải có hourly_rate");
    }
    return value;
  });
  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};
