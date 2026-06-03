import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository";

export class AuthService {
  private authRepository = new AuthRepository();

  async login(email: string, password: string) {
    const user =
      await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const validPassword =
      await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        companyId: user.companyId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "15m",
      }
    );

    return {
      accessToken,
    };
  }
}