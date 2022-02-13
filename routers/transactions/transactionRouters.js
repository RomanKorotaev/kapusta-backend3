import Router from 'express';
// import transactionModel from '../../model/transactionModel.js';
import guard from '../../middlewares/guard.js';
import TransactionController from '../../controllers/transactions/transactionController.js';
import {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateCreateSpecificTransaction
} from '../../middlewares/validateTransaction.js';

const router = new Router();

//Чтобы роутинг работал без ошибок эти маршруты должны быть раньше/выше в коде

//возможно не понадобится,согласовать по ТЗ и с фронтов
router.get('/transactions/balance', guard, TransactionController.getBalance);

router.post(
  '/transactions/expense',
  guard,
  validateCreateSpecificTransaction,
  TransactionController.createExpense,
);

//возможно не понадобится,согласовать по ТЗ и с фронтов
router.get('/transactions/expense', guard, TransactionController.getAllExpenses);

router.post(
  '/transactions/income',
  guard,
  validateCreateSpecificTransaction,
  TransactionController.createIncome,
);

//возможно не понадобится,согласовать по ТЗ и с фронтов
router.get('/transactions/income', guard, TransactionController.getAllIncomes);

//возможно не понадобится,согласовать по ТЗ и с фронтов
router.post('/transactions', guard, validateCreateTransaction, TransactionController.create);

//возможно не понадобится,согласовать по ТЗ и с фронтов
router.get('/transactions', guard, TransactionController.getAll);
router.put('/transactions/:id', guard, validateUpdateTransaction, TransactionController.update);
router.delete('/transactions/:id', guard, TransactionController.delete);
router.get('/transactions/month', guard, TransactionController.getMonthStatistic);
router.get('/transactions/summary', guard, TransactionController.getSummaryStatistics);

//возможно не понадобится,согласовать по ТЗ и с фронтов
router.get('/transactions/:id', guard, TransactionController.getOne);

export default router;
