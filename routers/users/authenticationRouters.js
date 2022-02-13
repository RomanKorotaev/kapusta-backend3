import Router from 'express';
import {
  registration,
  login,
  logout,
  update,
} from '../../controllers/authentication/authenticationController.js';
import guard from '../../middlewares/guard.js';
import { validateCreateUser, validateUpdateUser } from '../../middlewares/validationUser.js';

const router = new Router();

router.post('/registration', validateCreateUser, registration);
router.post('/login', login);
router.post('/logout', guard, logout);
router.patch('/update', guard, validateUpdateUser, update);

export default router;
