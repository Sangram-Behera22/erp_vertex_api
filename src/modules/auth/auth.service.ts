import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import type { AuthRepository } from './auth.repository.js';
import {
  type LoginDto,
  type RegisterUserDto,
  type ChangePasswordDto,
  type ForgotPasswordDto,
  type ResetPasswordDto,
} from './auth.types.js';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(dto: RegisterUserDto) {
    const existingUser = await this.authRepository.findUserByEmail(dto.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.authRepository.createUser({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      companyId: dto.companyId,
      passwordHash,
      ...(dto.username !== undefined && {
        username: dto.username,
      }),
    });

    await this.authRepository.createAuditLog({
      userId: user.id,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: user.id,
      newValue: user,
    });

    return user;
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account disabled');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const roles = user.roles.map((item) => item.role.code);

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        roles,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await this.authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
    });

    await this.authRepository.updateLastLogin(user.id);

    await this.authRepository.createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const storedToken = await this.authRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    const user = await this.authRepository.findUserById(storedToken.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const roles = user.roles.map((item) => item.role.code);

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        roles,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '15m',
      },
    );

    return {
      accessToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await this.authRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      return;
    }

    await this.authRepository.revokeRefreshToken(storedToken.id);
  }

  async logoutAll(userId: string) {
    await this.authRepository.revokeAllUserTokens(userId);

    await this.authRepository.createAuditLog({
      userId,
      action: 'LOGOUT_ALL',
      entityType: 'USER',
      entityId: userId,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);

    if (!isMatch) {
      throw new Error('Current password incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.authRepository.updatePassword(userId, passwordHash);

    await this.authRepository.revokeAllUserTokens(userId);

    await this.authRepository.createAuditLog({
      userId,
      action: 'CHANGE_PASSWORD',
      entityType: 'USER',
      entityId: userId,
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    return {
      resetToken: token,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const resetToken = await this.authRepository.findPasswordResetToken(tokenHash);

    if (!resetToken) {
      throw new Error('Invalid token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error('Token expired');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.authRepository.updatePassword(resetToken.userId, passwordHash);

    await this.authRepository.markPasswordResetUsed(resetToken.id);

    await this.authRepository.revokeAllUserTokens(resetToken.userId);

    await this.authRepository.createAuditLog({
      userId: resetToken.userId,
      action: 'RESET_PASSWORD',
      entityType: 'USER',
      entityId: resetToken.userId,
    });
  }

  async getCurrentUser(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserPermissions(userId: string) {
    const user = await this.authRepository.getUserPermissions(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const permissions = user.roles.flatMap((userRole) =>
      userRole.role.permissions.map((permission) => permission.permission.code),
    );

    return [...new Set(permissions)];
  }
}
