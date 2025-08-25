import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        // Use error.issues instead of error.errors
        throw new BadRequestException(
          error.issues.map((e) => e.message).join(', '),
        );
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
