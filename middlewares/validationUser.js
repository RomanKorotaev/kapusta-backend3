import Joi from 'joi';

const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).optional(),
});

const userUpdateSchema = Joi.object({
  balance: Joi.number().optional(),
  name: Joi.string().optional(),
});

export const validateCreateUser = async (req, res, next) => {
  try {
    const value = await userCreateSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).json({ message: `Field : ${err.message.replace(/"/g, '')}` });
  }
  next();
};

export const validateUpdateUser = async (req, res, next) => {
  try {
    const value = await userUpdateSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).json({ message: `Field : ${err.message.replace(/"/g, '')}` });
  }
  next();
};
