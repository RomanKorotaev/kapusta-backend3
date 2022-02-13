import mongoose from 'mongoose';
const { Schema, model, SchemaTypes } = mongoose;
import { categoryOfTransaction, EXPENSE, INCOME } from '../lib/constants.js';

const transactionModel = new Schema(
  {
    // ПРИМЕТКА: Предполагается два типа транакций -доход и расход ( income, exprnse)
    transactionType: {
      type: String,
      enum: {
        values: [EXPENSE, INCOME],
        message: "Transaction's type is not allowed",
      },
      required: true,
    },

    sum: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: {
        values: [...categoryOfTransaction],
        message: "Transaction's category is not allowed",
      },
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    dayCreate: {
      type: Number,
      required: true,
    },
    monthCreate: {
      type: Number,
      required: true,
    },
    yearCreate: {
      type: Number,
      required: true,
    },

    dateOfTransaction: {
      type: Date,
      default: Date.now(),
    },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: 'user', // или 'users'
      required: true,
    },
    idT: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: false },
);

export default model('transactions', transactionModel);
