import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({
    example: 'User created successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    example: {
      id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      name: 'John Doe',
    },
    description: 'Created user information',
  })
  user: {
    id: string;
    email: string;
    name: string;
  };
}
