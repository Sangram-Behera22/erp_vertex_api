import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../shared/validators/validate";
import { loginSchema } from "./auth.validation";

const router = Router();

const authController =
  new AuthController();

router.post(
  "/login",
  validate({
    body: loginSchema,
  }),
  authController.login
);

export default router;