import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import ApiResponse from '../../utils/ApiResponse';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // // Check if user is active
    // if (!user.isActive) {
    //   throw new UnauthorizedException('User account is inactive');
    // }

    // Simple password comparison (no encryption)
    if (user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user data without password
    return ApiResponse.success('Login successful', {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = new this.userModel({ email, password, name });
    await user.save();

    return ApiResponse.created('User created successfully', {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  }

  async createDefaultAdmin() {
    const defaultEmail = 'admin@admin.com';
    const defaultPassword = 'Admin@123';
    const defaultName = 'Admin';

    // Check if admin already exists
    const existingAdmin = await this.userModel.findOne({ email: defaultEmail }).exec();
    
    if (existingAdmin) {
      return ApiResponse.success('Default admin user already exists', {
        user: {
          id: existingAdmin._id.toString(),
          email: existingAdmin.email,
          name: existingAdmin.name,
        },
      });
    }

    // Create default admin user
    const admin = new this.userModel({
      email: defaultEmail,
      password: defaultPassword,
      name: defaultName,
    });
    await admin.save();

    return ApiResponse.created('Default admin user created successfully', {
      user: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
      },
    });
  }
}
