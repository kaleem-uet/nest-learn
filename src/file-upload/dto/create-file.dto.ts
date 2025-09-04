import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;
  // You'll use this to set the uploader relation
}
