import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({
      where: { teacher: 'Nabil', subject: 'math' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  async findByLevel(level: string) {
    return this.prisma.course.findMany({
      where: { level, teacher: 'Nabil', subject: 'math' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteCourse(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  async addCourse(payload: any) {
    return this.prisma.course.create({
      data: {
        title:     payload.title,
        level:     payload.level     || '1as',
        type:      payload.type      || 'free',
        trimestre: payload.trimestre || 'T1',
        teacher:   'Nabil',
        subject:   'math',
        videoUrl:  payload.videoUrl  || null,
        pdfUrl:    payload.pdfUrl    || null,
      },
    });
  }
}
