import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { RedisService } from '../redis/redis.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private redis: RedisService,
  ) {}

  @Post('register')
  async register(
    @Body() body: { telegramId: string; username?: string; firstName?: string; referralCode?: string },
  ) {
    return this.usersService.getOrCreate(
      BigInt(body.telegramId),
      body.username,
      body.firstName,
      body.referralCode,
    );
  }

  @Post('daily-bonus')
  async dailyBonus(@Body() body: { telegramId: string }) {
    return this.usersService.claimDailyBonus(BigInt(body.telegramId));
  }

  @Get('balance')
  async balance(@Query('telegramId') telegramId: string) {
    const user = await this.usersService.getProfile(BigInt(telegramId))
    return { bonusBalance: user?.bonusBalance ?? 0 }
  }

  @Get('notifications')
  async getNotifications(@Query('telegramId') telegramId: string) {
    const key = `notif:${telegramId}`;
    const raw = await this.redis.get(key);
    return { notifications: raw ? JSON.parse(raw) : [] };
  }

  @Post('notifications/read')
  async clearNotifications(@Body() body: { telegramId: string }) {
    await this.redis.set(`notif:${body.telegramId}`, '[]', 1);
    return { ok: true };
  }

  @Get(':telegramId/profile')
  async profile(@Param('telegramId') telegramId: string) {
    return this.usersService.getProfile(BigInt(telegramId));
  }
}
