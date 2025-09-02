import {
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class ThrottlerLoginGuard extends ThrottlerGuard {
  /**
   * Generates a unique tracker key for login attempts based on email.
   * Falls back to IP if email is not present in the request body.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const email = req?.body?.email;
    return email ? `login:${email}` : req.ip;
  }

  /**
   * Sets a custom limit of 5 attempts.
   */
  protected getLimit(context: ExecutionContext): number {
    return 5;
  }

  /**
   * Sets TTL (time to live) for the throttle limit in seconds.
   */
  protected getTTL(context: ExecutionContext): number {
    return 60;
  }

  /**
   * Throws a custom exception when throttling limit is exceeded.
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    limit: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many login attempts. Please try again in a minute.',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
