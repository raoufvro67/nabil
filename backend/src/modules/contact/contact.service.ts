import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async save(data: { name: string; email: string; subject: string; message: string }) {
    return this.prisma.contact.create({ data });
  }
}
