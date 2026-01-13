import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guard/auth.guard';

@ApiTags('Users')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
