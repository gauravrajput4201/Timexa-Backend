import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import Joi from 'joi';

export class PasswordResetDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  
  @ApiProperty({
     example: 'password123',
     description: 'User password',
     required: true,
     minLength: 6,
   })
   @IsString()
   @IsNotEmpty({ message: 'Password is required' })
   @MinLength(6, { message: 'Password must be at least 6 characters long' })
   password: string;
   
   @ApiProperty({
    example: '1234',
    description: 'OTP for password reset',
    required: true,
    minLength: 4,
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @MinLength(4, { message: 'OTP must be at least 4 characters long' })
  otp: string;
   
}


export const passwordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
  }),
  otp: Joi.string().required().messages({
    'any.required': 'Otp is required',
    'string.empty': 'Otp is required',
  }),
});