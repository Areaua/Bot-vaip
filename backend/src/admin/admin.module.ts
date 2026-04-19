import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { BotModule } from '../bot/bot.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [BotModule, RedisModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
