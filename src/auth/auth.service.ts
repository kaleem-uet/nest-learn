import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register.user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.user.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }
    // hash the password before saving (you can use bcrypt or any other library)
    const newPassword = await this.hashPassword(registerDto.password);
    const newUser = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: newPassword,
      role: UserRole.USER,
    });
    const saveUser = await this.userRepository.save(newUser);
    const { password, ...result } = saveUser; // Exclude password from the returned user object
    return {
      user: result,
      message: 'User registered successfully',
    };
  }

  // create admin user
  async createAdmin(registerDto: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }
    // hash the password before saving (you can use bcrypt or any other library)
    const newPassword = await this.hashPassword(registerDto.password);
    const newUser = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: newPassword,
      role: UserRole.ADMIN,
    });
    const saveUser = await this.userRepository.save(newUser);
    const { ...result } = saveUser; // Exclude password from the returned user object
    return {
      user: result,
      message: 'Admin registered successfully',
    };
  }

  // login user
  async login(loginDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    // generate and return a JWT or session (not implemented here)
    const token = this.generateToken(user);
    const { password, ...result } = user; // Exclude password from the returned user object
    return {
      user: result,
      message: 'User logged in successfully',
      token,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: 'refreshSecretKey',
      });
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      const token = this.generateToken(user);
      const { password, ...result } = user; // Exclude password from the returned user object
      return {
        user: result,
        message: 'Token refreshed successfully',
        token,
      };
    } catch (error: unknown) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async getCurrentUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user; // Exclude password from the returned user object
    return result;
  }
  // delete user by id
  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
  private generateToken(user: User) {
    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: 'jwtSecretKey',
      expiresIn: '1h',
    });
  }
  private generateRefreshToken(user: User) {
    const payload = { sub: user.id };
    return this.jwtService.sign(payload, {
      secret: 'refreshSecretKey',
      expiresIn: '7d',
    });
  }
  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
