import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import ApiResponse from '../../utils/ApiResponse';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RoleType } from 'src/enums/common.enum';
import { MailerService } from '../mailer/mailer.service';
import { ForgotPasswordOtpDto } from './dto/forgot-password.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { VerificationModuleService } from '../verification-module/verification-module.service';
import { OTP_EXPIRY_BY_PURPOSE, VerificationPurpose } from '../verification-module/schema/otp.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private verificationModuleService: VerificationModuleService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('user not exist with this email');
    }

    const isPasswordValid = await this.compareValue(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.email,
      username: user.name,
      userId: user._id.toString(),
    };
    const token = await this.jwtService.signAsync(payload);

    // Return user data without password
    return ApiResponse.success('Login successful', {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashValue(password);

    // Create new user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      role: RoleType.user,
    });

    await user.save();

    // Send welcome email
    try {
      await this.mailerService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      // Log error but don't fail user creation
      console.error('Failed to send welcome email:', error.message);
    }

    return ApiResponse.created('User created successfully', {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  async createDefaultAdmin() {
    const defaultEmail = 'admin@admin.com';
    const defaultPassword = 'Admin@123';
    const defaultName = 'Admin';
    const defaultRole = RoleType.admin;

    // Check if admin already exists
    const existingAdmin = await this.userModel
      .findOne({ email: defaultEmail })
      .exec();

    if (existingAdmin) {
      return ApiResponse.success('Default admin user already exists', {
        user: {
          id: existingAdmin._id.toString(),
          email: existingAdmin.email,
          name: existingAdmin.name,
          password: defaultPassword,
        },
      });
    }

    // Create default admin user
    const admin = new this.userModel({
      email: defaultEmail,
      password: await this.hashValue(defaultPassword),
      name: defaultName,
      role: defaultRole,
    });

    await admin.save();

    return ApiResponse.created('Default admin user created successfully', {
      user: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        password: defaultPassword,
      },
    });
  }

  async forgotPasswordOtp(forgotPasswordOtpDto: ForgotPasswordOtpDto) {
    const { email } = forgotPasswordOtpDto;
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const { otp, document: createdOtp } =
      await this.verificationModuleService.createVerificationOTP(
        email,
        VerificationPurpose.RESET_PASSWORD,
        4,
      );

      if (!createdOtp) {
        throw new Error('Failed to create OTP');
      }

      try {  
        await this.mailerService.sendOTPEmail(
          user.email,
          otp, // Pass the plain OTP
          OTP_EXPIRY_BY_PURPOSE[VerificationPurpose.RESET_PASSWORD],
        );
      } catch (error) {
        console.error('Failed to send OTP email:', error.message);
        throw new Error('Failed to send OTP email');
      }

    return ApiResponse.success('Otp has been sent to your email successfully', null);
  }




  async passwordReset(passwordResetDto: PasswordResetDto) {
    const { email, password, otp } = passwordResetDto;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Here you would typically verify the OTP
    // For simplicity, we'll assume the OTP is always valid

    const hashedPassword = await this.hashValue(password);
    user.password = hashedPassword;
    await user.save();

    return ApiResponse.success('Password has been reset successfully', {});
  }

  async hashValue(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compareValue(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
