import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private minioClient: Minio.Client;
  private bucket: string;
  private readonly logger = new Logger(UploadService.name);
  private useCloudinary = false;

  constructor() {
    // If CLOUDINARY_URL is provided, we use Cloudinary instead of MinIO
    if (process.env.CLOUDINARY_URL) {
      this.useCloudinary = true;
      cloudinary.config({
        // The URL is automatically parsed by the cloudinary SDK
      });
      this.logger.log('☁️  Cloudinary initialized successfully as Storage Provider');
      return; // Skip MinIO initialization
    }

    this.logger.log('🪣  MinIO initialized as Storage Provider');
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });
    this.bucket = process.env.MINIO_BUCKET || 'rentflow';
    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket);
      }
    } catch (error) {
      this.logger.warn('MinIO not available, file uploads might fail locally: ' + error.message);
    }
  }

  async upload(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const uniqueName = `${uuidv4()}`;

    // Cloudinary Upload
    if (this.useCloudinary) {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: `rentflow/${folder}`, public_id: uniqueName, resource_type: 'auto' },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Upload failed without error'));
            resolve(result.secure_url);
          }
        ).end(file.buffer);
      });
    }

    // MinIO Upload
    const fileName = `${folder}/${uniqueName}.${ext}`;
    await this.minioClient.putObject(this.bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    return `/${this.bucket}/${fileName}`;
  }

  async delete(filePath: string): Promise<void> {
    // Cloudinary Deletion
    if (this.useCloudinary && filePath.includes('cloudinary.com')) {
      // Extract public_id from secure_url
      const urlParts = filePath.split('/');
      const fileNameWithExt = urlParts[urlParts.length - 1];
      const folderName = urlParts[urlParts.length - 2];
      const publicId = `rentflow/${folderName}/${fileNameWithExt.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
      return;
    }

    // MinIO Deletion
    const objectName = filePath.replace(`/${this.bucket}/`, '');
    await this.minioClient.removeObject(this.bucket, objectName);
  }

  async getSignedUrl(filePath: string, expiry: number = 3600): Promise<string> {
    // Cloudinary files are usually uploaded publicly or pre-signed. For simplicity, we just return the full secure_url
    if (this.useCloudinary || filePath.startsWith('http')) {
      return filePath;
    }

    const objectName = filePath.replace(`/${this.bucket}/`, '');
    return this.minioClient.presignedGetObject(this.bucket, objectName, expiry);
  }
}
