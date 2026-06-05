import { type Request, type Response } from 'express';
import type { AuthService } from './auth.service.js';
// import {apiResponse} from '../../shared/utils/response.util.js'

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body, req.ip, req.headers['user-agent']);

    res.json(result);
  };

  register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);

    res.json(result);
  };

  logout = async (req: Request, res: Response) =>{
    const result = await this.authService.logout(req.body.refreshToken);
    res.json(result);
  }

  
}
