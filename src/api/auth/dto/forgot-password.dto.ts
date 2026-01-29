import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, isNumber, IsOptional } from "class-validator";
import Joi from "joi";

export class ForgotPasswordOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 4,
    description: 'Length of the OTP code',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  length?: number;
}


export const forgotPasswordOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email is required',
    }),
  length: Joi.number()
    .optional()
    .messages({
      'number.base': 'Length must be a number',
    }),
});
