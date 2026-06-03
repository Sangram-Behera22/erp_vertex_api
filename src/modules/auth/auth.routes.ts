import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../shared/validators/validate.js';
import { loginSchema } from './auth.validation.js';

const router = Router();

const authController = new AuthController();

router.post(
  '/login',
  validate({
    body: loginSchema,
  }),
  authController.login,
);

export default router;
