import transactionModel from '../../model/transactionModel.js';
import mongoose from 'mongoose';
const { Types } = mongoose;
import UserModel from '../../model/userModel.js';

import { EXPENSE, INCOME, monthList, HttpCode } from '../../lib/constants.js';

class TransactionController {
  async create(req, res) {
    const { id: userId } = req.user;
    try {
      const {
        transactionType,
        sum,
        category,
        description,
        dayCreate,
        monthCreate,
        yearCreate,
        idT,
      } = req.body;
      const createTransaction = await transactionModel.create({
        transactionType,
        sum,
        category,
        description,
        dayCreate,
        monthCreate,
        yearCreate,
        owner: userId,
        idT,
      });
      return res.status(HttpCode.CREATED).json({
        status: 'success',
        code: HttpCode.CREATED,
        data: createTransaction,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getAll(req, res) {
    const { id: userId } = req.user;
    try {
      const transactionsAll = await transactionModel
        .find({ owner: userId })
        .populate({ path: 'owner', select: 'email id balance' });
      return res.status(HttpCode.OK).json({
        status: 'succes',
        code: HttpCode.OK,
        data: transactionsAll,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getOne(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(HttpCode.BAD_REQUEST).json({
          status: 'error',
          code: HttpCode.BAD_REQUEST,
          message: "Id is'nt indicated",
        });
      }
      const transactionOne = await transactionModel
        .find({ _id: id, owner: userId })
        .populate({ path: 'owner', select: 'email id balance' });
      if (!transactionOne) {
        return res.status(HttpCode.NOT_FOUND).json({
          status: 'error',
          code: HttpCode.NOT_FOUND,
          message: 'Transaction not found',
        });
      }
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: transactionOne,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async update(req, res) {
    const { id: userId } = req.user;
    try {
      const transaction = req.body;
      const { id } = req.params;
      if (!id) {
        return res.status(HttpCode.BAD_REQUEST).json({
          status: 'error',
          code: HttpCode.BAD_REQUEST,
          message: "Id is'nt indicated",
        });
      }

      const updatedTransaction = await transactionModel
        .findOneAndUpdate({ _id: id, owner: userId }, { ...transaction }, { new: true })
        .populate({ path: 'owner', select: 'email id balance' });
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: updatedTransaction,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async delete(req, res) {
    const { id: userId } = req.user;
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(HttpCode.BAD_REQUEST).json({
          status: 'error',
          code: HttpCode.BAD_REQUEST,
          message: "Id is'nt indicated",
        });
      }

      const user = await UserModel.findById(userId);
      const transaction = await transactionModel.findOne({ idT: id });
      console.log(transaction);
      switch (transaction.transactionType) {
        case 'income':
          await UserModel.findByIdAndUpdate(userId, { balance: user.balance - transaction.sum });
          break;
        case 'expense':
          await UserModel.findByIdAndUpdate(userId, { balance: user.balance + transaction.sum });
          break;
        default:
          break;
      }

      const deletedTransaction = await transactionModel
        .findOneAndRemove({
          idT: id,
          owner: userId,
        })
        .populate({ path: 'owner', select: 'email id balance' });
      if (!deletedTransaction) {
        return res.status(HttpCode.NOT_FOUND).json({
          status: 'error',
          code: HttpCode.NOT_FOUND,
          message: 'Transaction not found',
        });
      }
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: deletedTransaction,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getMonthStatistic(req, res, next) {
    const { id: userId } = req.user;
    try {
      let { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
      month = Number(month);
      year = Number(year);
      const totalIncome = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: 'income',
            monthCreate: month,
            yearCreate: year,
          },
        },
        { $group: { _id: 'income', total: { $sum: '$sum' } } },
      ]);
      const totalExpense = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: 'expense',
            monthCreate: month,
            yearCreate: year,
          },
        },
        { $group: { _id: 'totalExpense', total: { $sum: '$sum' } } },
      ]);
      const salary = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'income',
          category: 'salary',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const additionalincome = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'income',
          category: 'additionalincome',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      //TODO изменить название категории
      const food = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'food',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const alcohol = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'alcohol',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const entertainment = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'entertainment',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const health = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'health',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const transport = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'transport',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const housing = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'housing',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const technics = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'technics',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const communal = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'communal',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const sport = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'sport',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const education = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'education',
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const other = await transactionModel
        .find({
          owner: userId,
          monthCreate: month,
          yearCreate: year,
          transactionType: 'expense',
          category: 'other',
        })
        .populate({ path: 'owner', select: 'email id balance' });

      const result = {
        month: monthList[month - 1].id,
        year: year,
        totalIncome: totalIncome[0]?.total || 0,
        totalExpense: totalExpense[0]?.total || 0,
        income: { salary: salary, additionalincome: additionalincome },
        expense: {
          food: food,
          alcohol: alcohol,
          entertainment: entertainment,
          health: health,
          transport: transport,
          housing: housing,
          technics: technics,
          communal: communal,
          sport: sport,
          education: education,
          other: other,
        },
      };
      return res.status(HttpCode.OK).json({
        status: 'succes',
        code: HttpCode.OK,
        data: result,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async createExpense(req, res) {
    const { id: userId } = req.user;
    try {
      const {
        sum,
        category,
        description,
        dateOfTransaction,
        dayCreate,
        monthCreate,
        yearCreate,
        transactionType,
        idT,
      } = req.body;

      const createExpenseTransaction = await transactionModel.create({
        transactionType,
        sum,
        category,
        description,
        dateOfTransaction,
        dayCreate,
        monthCreate,
        yearCreate,
        owner: userId,
        idT,
      });

      const user = await UserModel.findById(userId);
      await UserModel.findByIdAndUpdate(userId, { balance: user.balance - sum });

      return res.status(HttpCode.CREATED).json({
        status: 'success',
        code: HttpCode.CREATED,
        data: createExpenseTransaction,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getAllExpenses(req, res) {
    const { id: userId } = req.user;
    try {
      const allExpenses = await transactionModel
        .find({ transactionType: EXPENSE, owner: userId })
        .populate({ path: 'owner', select: 'email id balance' });
      return res.status(HttpCode.OK).json({
        status: 'succes',
        code: HttpCode.OK,
        data: allExpenses,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getSummaryStatistics(req, res, next) {
    const { id: userId } = req.user;
    try {
      const transactionType = req.query.type;
      if (!transactionType) {
        return res.status(HttpCode.BAD_REQUEST).json({
          status: 'error',
          code: HttpCode.BAD_REQUEST,
          message: 'Transaction type in query string is required',
        });
      }
      const currentMonth = new Date().getMonth() + 1;
      let year = new Date().getFullYear();
      let prevYear = year;

      function getPrevMonth(x) {
        let prevMonth;
        if (currentMonth - x >= 1) {
          prevMonth = currentMonth - x;
        } else {
          prevMonth = 12 + currentMonth - x;
          prevYear = year - 1;
        }
        return prevMonth;
      }

      const listTransaction = await transactionModel
        .find({
          transactionType: transactionType,
          owner: userId,
        })
        .populate({ path: 'owner', select: 'email id balance' });
      const currentMonthSum = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: transactionType,
            monthCreate: currentMonth,
            yearCreate: prevYear,
          },
        },
        { $group: { _id: 1, total: { $sum: '$sum' } } },
      ]);
      const month1 = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: transactionType,
            monthCreate: getPrevMonth(1),
            yearCreate: prevYear,
          },
        },
        { $group: { _id: 2, total: { $sum: '$sum' } } },
      ]);

      const month2 = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: transactionType,
            monthCreate: getPrevMonth(2),
            yearCreate: prevYear,
          },
        },
        { $group: { _id: 3, total: { $sum: '$sum' } } },
      ]);

      const month3 = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: transactionType,
            monthCreate: getPrevMonth(3),
            yearCreate: prevYear,
          },
        },
        { $group: { _id: 4, total: { $sum: '$sum' } } },
      ]);

      const month4 = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: transactionType,
            monthCreate: getPrevMonth(4),
            yearCreate: prevYear,
          },
        },
        { $group: { _id: 5, total: { $sum: '$sum' } } },
      ]);

      const month5 = await transactionModel.aggregate([
        {
          $match: {
            owner: Types.ObjectId(userId),
            transactionType: transactionType,
            monthCreate: getPrevMonth(5),
            yearCreate: prevYear,
          },
        },
        { $group: { _id: 6, total: { $sum: '$sum' } } },
      ]);

      const result = {
        type: transactionType,
        listOfTransactions: listTransaction,
        summaryList: {
          [monthList[currentMonth - 1].name]: currentMonthSum[0]?.total || 0,
          [monthList[getPrevMonth(1) - 1].name]: month1[0]?.total || 0,
          [monthList[getPrevMonth(2) - 1].name]: month2[0]?.total || 0,
          [monthList[getPrevMonth(3) - 1].name]: month3[0]?.total || 0,
          [monthList[getPrevMonth(4) - 1].name]: month4[0]?.total || 0,
          [monthList[getPrevMonth(5) - 1].name]: month5[0]?.total || 0,
        },
      };
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: result,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async createIncome(req, res) {
    const { id: userId } = req.user;
    try {
      const {
        sum,
        category,
        description,
        dateOfTransaction,
        dayCreate,
        monthCreate,
        yearCreate,
        transactionType,
        idT,
      } = req.body;

      const createIncomeTransaction = await transactionModel.create({
        transactionType,
        sum,
        category,
        description,
        dateOfTransaction,
        dayCreate,
        monthCreate,
        yearCreate,
        owner: userId,
        idT,
      });

      const user = await UserModel.findById(userId);
      await UserModel.findByIdAndUpdate(userId, { balance: user.balance + sum });

      return res.status(HttpCode.CREATED).json({
        status: 'success',
        code: HttpCode.CREATED,
        data: createIncomeTransaction,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getAllIncomes(req, res) {
    const { id: userId } = req.user;
    try {
      const allIncomes = await transactionModel
        .find({ transactionType: INCOME, owner: userId })
        .populate({ path: 'owner', select: 'email id balance' });
      return res.status(HttpCode.OK).json({
        status: 'succes',
        code: HttpCode.OK,
        data: allIncomes,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getSumOfAllIncomes() {
    const { id: userId } = req.user;
    try {
      const data = await transactionModel.aggregate([
        { $match: { transactionType: INCOME, owner: Types.ObjectId(userId) } },
        {
          $group: {
            _id: 'sumOfAllIncomes',
            totalSum: { $sum: '$sum' },
          },
        },
      ]);
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: data,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }

  async getSumOfAllExpenses() {
    const { id: userId } = req.user;
    try {
      const data = await transactionModel.aggregate([
        { $match: { transactionType: EXPENSE, owner: Types.ObjectId(userId) } },
        {
          $group: {
            owner: Types.ObjectId(userId),
            _id: 'sumOfAllExpenses',
            totalSum: { $sum: '$sum' },
          },
        },
      ]);
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: data,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }
  /////////////////////--------------------------------------------

  async getBalance(req, res) {
    const { id: userId } = req.user;
    try {
      const sumOfAllIncomes = await transactionModel.aggregate([
        { $match: { transactionType: INCOME, owner: Types.ObjectId(userId) } },
        {
          $group: {
            _id: 'sumOfAllIncomes',
            totalSum: { $sum: '$sum' },
          },
        },
      ]);

      const sumOfAllExpenses = await transactionModel.aggregate([
        { $match: { transactionType: EXPENSE, owner: Types.ObjectId(userId) } },
        {
          $group: {
            _id: 'sumOfAllExpenses',
            totalSum: { $sum: '$sum' },
          },
        },
      ]);

      let balance = (await sumOfAllIncomes[0].totalSum) - sumOfAllExpenses[0].totalSum;

      return res.status(HttpCode.CREATED).json({
        status: 'success',
        code: HttpCode.CREATED,
        data: balance,
      });
    } catch (err) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  }
}

export default new TransactionController();
