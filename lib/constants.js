export const monthList = [
  { id: 1, name: 'january' },
  { id: 2, name: 'february' },
  { id: 3, name: 'march' },
  { id: 4, name: 'april' },
  { id: 5, name: 'may' },
  { id: 6, name: 'june' },
  { id: 7, name: 'july' },
  { id: 8, name: 'august' },
  { id: 9, name: 'september' },
  { id: 10, name: 'october' },
  { id: 11, name: 'november' },
  { id: 12, name: 'december' },
];

//Это константы, которые описывают типы транзакций. У тас только 2 типа: расход и доход
export const EXPENSE = 'expense';
export const INCOME = 'income';

export const LIMIT_JSON = 5000;

export const HttpCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const categoryOfTransaction = [
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
];
