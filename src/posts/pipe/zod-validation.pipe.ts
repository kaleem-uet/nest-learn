import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Convert class instances to plain objects
    const plainValue =
      value instanceof Object && 'constructor' in value ? { ...value } : value;

    try {
      return this.schema.parse(plainValue);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(
          error.issues
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        );
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
