import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorData: any = null;

    // Handle HttpException (NestJS exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extract message from exception response
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;

        // Handle validation errors (array of messages)
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
          // Optionally include detailed validation errors in development
          if (process.env.NODE_ENV === 'development') {
            errorData = { validationErrors: responseObj.message };
          }
        }

        // Include additional error details in development mode
        if (process.env.NODE_ENV === 'development' && responseObj.error) {
          errorData = { ...errorData, error: responseObj.error };
        }
      }
    }
    // Handle other errors (non-HTTP exceptions)
    else if (exception instanceof Error) {
      message = exception.message;

      // Log unexpected errors with stack trace
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );

      // In production, hide internal error details from client
      if (process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred';
      } else {
        // In development, include stack trace
        errorData = {
          error: exception.name,
          stack: exception.stack,
        };
      }
    }

    // Log the error with request details
    this.logError(exception, request, status);

    // Send response using ApiResponse format
    const errorResponse = new ApiResponse(
      false,
      status,
      message,
      errorData || null,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Log error details for monitoring and debugging
   */
  private logError(exception: unknown, request: Request, status: number) {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';

    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      ip: request.ip,
      userAgent: request.get('user-agent') || 'Unknown',
    };

    // Log based on severity
    if (status >= 500) {
      this.logger.error(
        `Server Error: ${JSON.stringify(errorLog)}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else if (status >= 400) {
      this.logger.warn(`Client Error: ${JSON.stringify(errorLog)}`);
    } else {
      this.logger.log(`Error: ${JSON.stringify(errorLog)}`);
    }
  }
}
