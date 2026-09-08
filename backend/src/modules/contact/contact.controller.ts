import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ContactService } from './contact.service';

class ContactDto {
  name!: string;
  email!: string;
  subject!: string;
  message!: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async send(@Body() body: ContactDto) {
    if (!body.name || !body.email || !body.subject || !body.message) {
      throw new BadRequestException('Tous les champs sont requis');
    }
    await this.contactService.save(body);
    return { ok: true };
  }
}
