import { Controller, Post, Get, Body } from '@nestjs/common';
import { SpinService } from './spin.service';

@Controller('spin')
export class SpinController {
  constructor(private spinService: SpinService) {}

  @Post()
  async spin(@Body() body: { telegramId: string }) {
    return this.spinService.spin(BigInt(body.telegramId));
  }

  @Get('status')
  async status(@Body() body: { telegramId: string }) {
    return this.spinService.getStatus(BigInt(body.telegramId));
  }
}