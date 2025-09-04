export class FileUploadResponseDto {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  description?: string;
  createdAt: Date;
}
