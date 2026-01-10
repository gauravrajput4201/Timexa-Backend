import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'Login successful',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    example: {
      id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      name: 'John Doe',
    },
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    name: string;
  };
}
