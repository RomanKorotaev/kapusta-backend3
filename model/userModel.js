import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: 'Guest',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      // TODO пароль не обязательный
      // required: [true, 'Password is required'],
    },
    token: {
      type: String,
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false },
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcryptjs.genSalt(6);
    this.password = await bcryptjs.hash(this.password, salt);
  }
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

const UserModel = model('user', userSchema);

export default UserModel;
