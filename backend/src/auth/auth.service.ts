import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly adminUser = process.env.ADMIN_USER || 'nabil';
  private readonly adminPass = process.env.ADMIN_PASS || 'changeme';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /* ── Admin ── */
  async validateAdmin(username: string, password: string) {
    if (username === this.adminUser && password === this.adminPass) {
      return { id: 'admin', username, role: 'admin' };
    }
    return null;
  }

  /* ── Students ── */
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: { name: string; email: string; password: string; plan: string; trimestre?: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        plan: data.plan || 'free',
        trimestre: data.plan === 'quarterly' ? (data.trimestre ?? 'T1') : null,
      },
    });
  }

  async validateStudent(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  /* ── JWT ── */
  signToken(user: any) {
    const payload = user.role === 'admin'
      ? { sub: user.id, username: user.username, role: 'admin' }
      : { sub: user.id, email: user.email, role: 'student', plan: user.plan, trimestre: user.trimestre ?? null };
    return {
      access_token: this.jwtService.sign(payload),
      role: payload.role,
      ...(payload.role === 'student' ? { name: user.name, email: user.email, plan: user.plan, trimestre: user.trimestre } : {}),
    };
  }
}
