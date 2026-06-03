import { type Request, type Response, type NextFunction } from "express";
import {  type ZodSchema } from "zod";

export const validate = (
  schema: {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
  }
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};