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

  /* ── Password reset ── */
  async forgotPassword(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return; // silent — don't reveal whether email exists

    const token =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // In production: send via email (Resend / SendGrid / etc.)
    // In dev: log the link to the console
    console.log(`\n[DEV] Lien de réinitialisation pour ${email}:`);
    console.log(`http://localhost:5173/reset-password?token=${token}\n`);

    return token; // returned to controller — expose only in dev
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) throw new Error('Token invalide ou expiré');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });
  }

  /* ── JWT ── */
  signToken(user: any) {
    const payload =
      user.role === 'admin'
        ? { sub: user.id, username: user.username, role: 'admin' }
        : { sub: user.id, email: user.email, role: 'student', plan: user.plan, trimestre: user.trimestre ?? null };
    return {
      access_token: this.jwtService.sign(payload),
      role: payload.role,
      ...(payload.role === 'student'
        ? { name: user.name, email: user.email, plan: user.plan, trimestre: user.trimestre }
        : {}),
    };
  }
}
