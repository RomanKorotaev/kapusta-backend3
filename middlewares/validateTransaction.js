import Joi from 'joi';

// Эта валидация при POST-запросе для универмального маршрута '/transactions'
const createTransactionSchema = Joi.object({
  transactionType: Joi.string().valid('income', 'expense').required(),
  sum: Joi.number().min(1).integer().required(),
  category: Joi.string()
    .valid(
      'transport',
      'food',
      'health',
      'alcohol',
      'entertainment',
      'housing',
      'technics',
      'communal',
      'sport',
      'education',
      'other',
      'salary',
      'additionalincome',
    )
    .required(),
  description: Joi.string().min(2).max(300).required(),
  dayCreate: Joi.number().integer().min(1).max(31).required(),
  monthCreate: Joi.number().integer().min(1).max(12).required(),
  yearCreate: Joi.number().integer().min(2018).max(2030).required(),
  idT: Joi.string().required(),
});

const updateTransactionSchema = Joi.object({
  transactionType: Joi.string().valid('income', 'expense').optional(),
  sum: Joi.number().min(1).integer().optional(),
  category: Joi.string()
    .valid(
      'transport',
      'food',
      'health',
      'alcohol',
      'entertainment',
      'housing',
      'technics',
      'communal',
      'sport',
      'education',
      'other',
      'salary',
      'additionalincome',
    )
    .optional(),
  description: Joi.string().min(2).max(300).optional(),
  dayCreate: Joi.number().integer().min(1).max(31).optional(),
  monthCreate: Joi.number().integer().min(1).max(12).optional(),
  yearCreate: Joi.number().integer().min(2018).max(2030).optional(),
  idT: Joi.string().required(),
}).or(
  'transactionType',
  'sum',
  'category',
  'description',
  'dayCreate',
  'monthCreate',
  'yearCreate',
  'id',
);

// А Эта валидация при POST-запросе для специфических маршрутов : '/transactions/expense' , '/transactions/income'
const createSpecificTransactionSchema = Joi.object({
  transactionType: Joi.string().valid('income', 'expense').required(),
  sum: Joi.number().min(1).integer().required(),
  category: Joi.string()
    .valid(
      'transport',
      'food',
      'health',
      'alcohol',
      'entertainment',
      'housing',
      'technics',
      'communal',
      'sport',
      'education',
      'other',
      'salary',
      'additionalincome',
    )
    .required(),
  description: Joi.string().min(2).max(300).required(),
  dayCreate: Joi.number().integer().min(1).max(31).required(),
  monthCreate: Joi.number().integer().min(1).max(12).required(),
  yearCreate: Joi.number().integer().min(2018).max(2030).required(),
  idT: Joi.string().required(),
});

export const validateCreateTransaction = async (req, res, next) => {
  try {
    const value = await createTransactionSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).json({ message: `Field : ${err.message.replace(/"/g, '')}` });
  }
  next();
};

export const validateUpdateTransaction = async (req, res, next) => {
  try {
    const value = await updateTransactionSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).json({ message: `Field : ${err.message.replace(/"/g, '')}` });
  }
  next();
};

export const validateCreateSpecificTransaction = async (req, res, next) => {
  try {
    const value = await createSpecificTransactionSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).json({ message: `Field : ${err.message.replace(/"/g, '')}` });
  }
  next();
};
