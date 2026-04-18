import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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

  @Get(':telegramId/profile')
  async profile(@Param('telegramId') telegramId: string) {
    return this.usersService.getProfile(BigInt(telegramId));
  }
}
