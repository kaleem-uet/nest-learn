import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// protect routs that require authentication
@Injectable()
export class jwtAuthGuard extends AuthGuard('jwt') {}
