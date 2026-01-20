import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Validation middleware that checks express-validator results
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? (err as any).path : 'unknown',
      message: err.msg,
    }));

    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: errorMessages,
      },
    });
    return;
  }

  next();
};

/**
 * Wrapper to run validation chains
 */
export const runValidations = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    validate(req, res, next);
  };
};
