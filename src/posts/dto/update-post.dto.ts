import { IsNumber, IsString, MinLength } from 'class-validator';

export class UpdatePostDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  title?: string;

  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Content must be at least 1 character long' })
  content?: string;

  @IsNumber({}, { message: 'Author ID must be a number' })
  authorId?: number;
}
