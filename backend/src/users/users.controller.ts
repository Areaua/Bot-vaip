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

  @Post('support')
  async support(@Body() body: { telegramId: string; text: string }) {
    const user = await this.usersService.getProfile(BigInt(body.telegramId))
    const adminChatId = process.env.ADMIN_CHAT_ID
    if (adminChatId && /^\d+$/.test(adminChatId)) {
      const name = user?.firstName ?? user?.username ?? body.telegramId
      const tag  = user?.username ? ` (@${user.username})` : ''
      await this.redis.set(`support_user:${body.telegramId}`, body.telegramId, 86400 * 7)
      // forward via bot API directly
      const BOT_TOKEN = process.env.BOT_TOKEN
      if (BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminChatId,
            text: `💬 <b>Звернення в підтримку</b>\n👤 ${name}${tag} [<code>${body.telegramId}</code>]\n\n${body.text}\n\n<i>Відповідайте через бот: /reply ${body.telegramId} ваш_текст</i>`,
            parse_mode: 'HTML',
          }),
        })
      }
    }
    return { ok: true }
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
