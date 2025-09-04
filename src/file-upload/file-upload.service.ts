import { File as FileEntity } from './entities/file.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async upload(
    file: Express.Multer.File,
    description?: string,
    user?: User,
  ): Promise<any> {
    const fileData = await this.cloudinaryService.upload(file);
    const newFile = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileData.secure_url,
      publicId: fileData.public_id,
      description: description || '',
      user: user,
    });

    return this.fileRepository.save(newFile);
  }

  async findAll(): Promise<FileEntity[]> {
    return this.fileRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<FileEntity | null> {
    const file = await this.fileRepository.findOneBy({ id });

    if (!file) {
      throw new NotFoundException('File with the given ID not found');
    }

    return file;
  }

  async remove(id: string): Promise<boolean> {
    const file = await this.fileRepository.findOneBy({ id });

    if (!file) {
      throw new NotFoundException('File with the given ID not found');
    }

    // Delete from Cloudinary
    await this.cloudinaryService.delete(file.publicId);

    // Delete from the database
    await this.fileRepository.remove(file);

    return true;
  }
}
