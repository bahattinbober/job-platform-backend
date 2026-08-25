import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request as ExpressRequest } from 'express';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Sadece PDF veya DOCX dosyaları kabul edilir',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.resumesService.saveResume(req.user.userId, file);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.resumesService.findAllForUser(req.user.userId);
  }
  @Get(':id/matching-jobs')
  findMatchingJobs(@Param('id') id: string) {
    return this.resumesService.findMatchingJobs(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.resumesService.deleteResume(req.user.userId, id);
  }
}
