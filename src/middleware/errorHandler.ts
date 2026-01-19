import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
