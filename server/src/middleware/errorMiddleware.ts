import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
    errors?: string[];
    type?: string;
}

const errorMiddleware = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Handle validation errors
    if (err.type === 'validation') {
        res.status(400).json({
            success: false,
            type: 'validation',
            message: 'Validation Error',
            errors: err.errors || [message]
        });
        return;
    }

    // Handle other types of errors
    res.status(statusCode).json({
        success: false,
        type: err.type || 'error',
        message,
        errors: err.errors || [message]
    });
};

export default errorMiddleware;