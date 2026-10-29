import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { error } from 'firebase-functions/logger';

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const description = STATUS_CODES[statusCode] ?? 'Error';
    const body: ApiErrorResponse = {
      statusCode,
      message: statusCode === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : description,
      error: description,
    };

    if (exception instanceof HttpException && statusCode !== HttpStatus.INTERNAL_SERVER_ERROR) {
      const details: unknown = exception.getResponse();
      if (typeof details === 'string') {
        body.message = details;
      } else if (typeof details === 'object' && details !== null) {
        if ('message' in details && this.isMessage(details.message)) {
          body.message = details.message;
        }
        if ('error' in details && typeof details.error === 'string') {
          body.error = details.error;
        }
      }
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Never log Axios config, request headers, query parameters or payloads.
      error('API request failed', {
        statusCode,
        method: request.method,
        path: request.path,
        errorType: exception instanceof Error ? exception.name : typeof exception,
      });
    }

    if (!response.headersSent) {
      response.status(statusCode).json(body);
    }
  }

  private isMessage(value: unknown): value is string | string[] {
    return typeof value === 'string' || (Array.isArray(value) && value.every(item => typeof item === 'string'));
  }
}
