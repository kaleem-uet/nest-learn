import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { jwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDto } from './dto/create-file.dto';
import { User } from 'src/auth/entities/user.entity';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { FileUploadResponseDto } from './dto/file-upload-response.dto';
import { File } from './entities/file.entity';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(jwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @CurrentUser() user: User,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.fileUploadService.upload(file, createFileDto.description, user);
  }

  @Get()
  @UseGuards(jwtAuthGuard)
  async getAllFiles(): Promise<FileUploadResponseDto[]> {
    return this.fileUploadService.findAll();
  }

  @Get(':id')
  @UseGuards(jwtAuthGuard)
  async getFileById(@Param('id') id: string): Promise<any> {
    return this.fileUploadService.findById(id);
  }
}
