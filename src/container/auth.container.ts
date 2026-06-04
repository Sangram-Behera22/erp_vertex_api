import { AuthRepository } from "../modules/auth/auth.repository.js";
import { AuthService } from "../modules/auth/auth.service.js";
import { AuthController } from "../modules/auth/auth.controller.js";

const authRepository = new AuthRepository();

const authService = new AuthService(
  authRepository
);

const authController = new AuthController(
  authService
);

export {
  authRepository,
  authService,
  authController,
};