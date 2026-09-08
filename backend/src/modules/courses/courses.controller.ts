import { Controller, Get, Param, Post, Delete, Body, UnauthorizedException, UploadedFile, UseInterceptors, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('detail/:id')
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Get(':level')
  findByLevel(@Param('level') level: string) {
    return this.coursesService.findByLevel(level);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  addCourse(@Body() payload: any, @Req() req: any) {
    if (!req.user || req.user.role !== 'admin') throw new UnauthorizedException('Admin only');
    return this.coursesService.addCourse(payload);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteCourse(@Param('id') id: string, @Req() req: any) {
    if (!req.user || req.user.role !== 'admin') throw new UnauthorizedException('Admin only');
    return this.coursesService.deleteCourse(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload/video')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('Only video files allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  }))
  uploadVideo(@UploadedFile() file: { filename: string; mimetype: string; size: number; originalname: string }, @Req() req: any) {
    if (!req.user || req.user.role !== 'admin') throw new UnauthorizedException('Admin only');
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${file.filename}`;
    return { url, filename: file.filename, type: 'video' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload/pdf')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_PDF_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('Only PDF files allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  uploadPdf(@UploadedFile() file: { filename: string; mimetype: string; size: number; originalname: string }, @Req() req: any) {
    if (!req.user || req.user.role !== 'admin') throw new UnauthorizedException('Admin only');
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${file.filename}`;
    return { url, filename: file.filename, type: 'pdf' };
  }
}
