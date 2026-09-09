import { Controller, Post, Body, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';

class AdminLoginDto      { username!: string; password!: string; }
class RegisterDto        { name!: string; email!: string; password!: string; plan!: string; trimestre?: string; }
class StudentLoginDto    { email!: string; password!: string; }
class ForgotPasswordDto  { email!: string; }
class ResetPasswordDto   { token!: string; password!: string; }

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** Admin login */
  @Post('login')
  async login(@Body() body: AdminLoginDto) {
    const user = await this.authService.validateAdmin(body.username, body.password);
    if (!user) throw new BadRequestException('Identifiants incorrects');
    return this.authService.signToken(user);
  }

  /** Student registration */
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const existing = await this.authService.findUserByEmail(body.email);
    if (existing) throw new ConflictException('Email déjà utilisé');
    const user = await this.authService.createUser(body);
    return this.authService.signToken(user);
  }

  /** Student login */
  @Post('student-login')
  async studentLogin(@Body() body: StudentLoginDto) {
    const user = await this.authService.validateStudent(body.email, body.password);
    if (!user) throw new BadRequestException('Email ou mot de passe incorrect');
    return this.authService.signToken(user);
  }

  /** Forgot password — sends reset link (logged to console in dev) */
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
    return { ok: true }; // always return ok — don't reveal if email exists
  }

  /** Reset password — validates token and updates password */
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(body.token, body.password);
      return { ok: true };
    } catch {
      throw new BadRequestException('Token invalide ou expiré');
    }
  }
}
