import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, loginSchema } from './dto/login.dto';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import ApiResponse from '../../utils/ApiResponse';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('create-default-admin')
  async createDefaultAdmin(): Promise<ApiResponse> {
    return await this.authService.createDefaultAdmin();
  }

  
  @Post('login')
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse> {
    return await this.authService.login(loginDto);
  }

  @Post('create-user')
  @UsePipes(new JoiValidationPipe(createUserSchema))
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse> {
    return await this.authService.createUser(createUserDto);
  }
}
