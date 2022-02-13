// import { request } from 'https';
import { HttpCode } from '../../constants/httpCode.js';
import users from '../../repository/users.js';
import JWT from 'jsonwebtoken';
// const SECRET_KEY = process.env.JWT_SECRET_KEY;

class AuthenticationService {
  async isUserExist(email) {
    const user = await users.findByEmail(email);
    return !!user;
  }

  async create(body) {
    const { id, name, email, balance } = await users.create(body);
    return { id, name, email, balance };
  }

  async getUser(email, password) {
    const user = await users.findByEmail(email);
    const isValidPassword = await user?.isValidPassword(password);
    if (!isValidPassword) {
      return null;
    }
    return user;
  }

  getToken(user) {
    const id = user.id;
    const payload = { id };
    const token = JWT.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '8h' });
    return token;
  }

  async setToken(id, token) {
    await users.updateToken(id, token);
  }

  // async update(body) {
  //   const { email, password } = body;
  //   const user = await users.findByEmail(email);
  //   const isValidPassword = await user?.isValidPassword(password);
  // }
}

const authenticationService = new AuthenticationService();

const registration = async (req, res, _next) => {
  const { email } = req.body;
  const isUserExist = await authenticationService.isUserExist(email);
  if (isUserExist) {
    return res
      .status(HttpCode.CONFLICT)
      .json({ status: 'error', code: HttpCode.CONFLICT, message: 'Email is already exist' });
  }

  const userData = await authenticationService.create(req.body);
  res.status(HttpCode.OK).json({ status: 'success', code: HttpCode.CREATED, userData });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authenticationService.getUser(email, password);
  if (!user) {
    return res
      .status(HttpCode.UNAUTHORIZED)
      .json({ status: 'error', code: HttpCode.UNAUTHORIZED, message: 'Invalid credentials' });
  }
  const { name, balance } = user;
  const token = authenticationService.getToken(user);
  await authenticationService.setToken(user.id, token);
  // console.log(`${(token, name, balance, email)}`);
  // console.log('test');
  res
    .status(HttpCode.OK)
    .json({ status: 'success', code: HttpCode.OK, userData: { token, name, balance, email } });
};

const logout = async (req, res, next) => {
  await authenticationService.setToken(req.user.id, null);
  res.status(HttpCode.NO_CONTENT).json({ status: 'success', code: HttpCode.NO_CONTENT });
};

const update = async (req, res, next) => {
  const updatedUser = await users.update(req.user.id, req.body);
  const email = updatedUser.email;
  const balance = updatedUser.balance;
  const name = updatedUser.name;
  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    userData: { name, email, balance },
  });
};

export { registration, login, logout, update };
