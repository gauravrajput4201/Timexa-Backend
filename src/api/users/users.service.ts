import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../auth/schemas/user.schema';
import { Model } from 'mongoose';
import { ApiAcceptedResponse } from '@nestjs/swagger';
import { ApiResponse } from 'src/utils/ApiResponse';

@Injectable()
export class UsersService {
 @InjectModel(User.name) private userModel: Model<User>;    
 
  async  getAllUsers() {
    const users = await this.userModel.find({}).select('-password').exec();
    if (!users || users.length === 0) {
      throw ApiResponse.notFound('No users found');
    }
    return users;
  }
}
