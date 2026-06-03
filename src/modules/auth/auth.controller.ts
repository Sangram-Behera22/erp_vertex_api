import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService = new AuthService();

  login = async (
    req: Request,
    res: Response
  ) => {
    const result =
      await this.authService.login(
        req.body.email,
        req.body.password
      );

    res.status(200).json(result);
  };
}