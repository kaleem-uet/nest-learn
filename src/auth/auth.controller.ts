import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { jwtAuthGuard } from './guards/jwt.auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { Roles } from './decorator/roles.decorator';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from './guards/roles.guard';
import { ThrottlerLoginGuard } from './guards/throttler.login.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(ThrottlerLoginGuard)
  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
  @UseGuards(jwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: unknown) {
    return user;
  }

  @Post('create-admin')
  @Roles(UserRole.ADMIN)
  @UseGuards(jwtAuthGuard, RolesGuard)
  createAdmin(@Body() registerDto: RegisterUserDto) {
    return this.authService.createAdmin(registerDto);
  }
}
