import { ApiProperty } from '@nestjs/swagger';

interface IApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
}

export class ApiResponse<T = any> implements IApiResponse<T> {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  status: number;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    description: 'Response data payload',
    required: false,
  })
  data?: T;

  constructor(success: boolean, status: number, message: string, data?: T) {
    this.success = success;
    this.status = status;
    this.message = message;
    this.data = data;
  }

  // Static factory methods for common responses
  static success<T>(message: string, data?: T, status: number = 200): ApiResponse<T> {
    return new ApiResponse(true, status, message, data);
  }

  static error(message: string, status: number = 400): ApiResponse<null> {
    return new ApiResponse(false, status, message, null);
  }

  static created<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse(true, 201, message, data);
  }

  static notFound(message: string = 'Resource not found'): ApiResponse<null> {
    return new ApiResponse(false, 404, message, null);
  }

  static unauthorized(message: string = 'Unauthorized access'): ApiResponse<null> {
    return new ApiResponse(false, 401, message, null);
  }

  static forbidden(message: string = 'Forbidden'): ApiResponse<null> {
    return new ApiResponse(false, 403, message, null);
  }
}

export default ApiResponse;
