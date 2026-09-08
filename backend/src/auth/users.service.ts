import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // For now a single admin user read from env
  private admin = {
    username: process.env.ADMIN_USER || 'nabil',
    password: process.env.ADMIN_PASS || 'changeme',
    role: 'admin',
  };

  async validateUser(username: string, pass: string) {
    if (username === this.admin.username && pass === this.admin.password) {
      const { password, ...rest } = this.admin;
      return rest;
    }
    return null;
  }
}
