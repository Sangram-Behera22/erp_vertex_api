export interface LoginDto {
  email: string;
  password: string;
}


export interface RegisterUserDto {
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  companyId: string;
  roles: string[];
}