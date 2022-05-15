import {Request, Response, NextFunction} from 'express';


export interface ErrorType {
    statusCode: number;
    name: string;
    message: string;
    fields?: { [field: string]: { message: string } };
}

export class ApiError extends Error implements ErrorType {
    public statusCode: number = 500;
    public fields?: { [field: string]: { message: string } };

    constructor(errorType: ErrorType) {
        super(errorType.message);
        this.name = errorType.name;
        if (errorType.statusCode) this.statusCode = errorType.statusCode;
        this.fields = errorType.fields;
    }
}

export class ErrorHandler {
    public static handleError(error: ApiError, req: Request, res: Response, next: NextFunction): void {
        const normalizedError: ApiError = ErrorHandler.normalizeError(error);
        const {name, message, fields, statusCode} = normalizedError;
        res.status(statusCode).json({name, message, fields});
        next();
    }

    private static normalizeError(error: ApiError): ApiError {
        const constants = {
            ValidateError: { statusCode: 400, name: 'Bad Request', message: 'validation error' },
            ValidationError: {statusCode: 400, name: 'Bad Request', message: 'validation error' },
            CastError: { statusCode: 500, name: 'Internal Server Error', message: 'database error' }
        }
        const normalizedError: ApiError = new ApiError(error);
        Object.keys(constants).forEach(errorKey => {
            if (errorKey === normalizedError.name) Object.assign(normalizedError, constants[errorKey]);
        });
        Object.keys(constants).forEach(errorTypeKey => {
            const errorType = constants[errorTypeKey];
            if (errorType.statusCode === normalizedError.statusCode) normalizedError.name = errorType.name;
        });
        return normalizedError;
    }
}
