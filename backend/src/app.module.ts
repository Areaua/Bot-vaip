import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SpinModule } from './spin/spin.module';
import { RedisModule } from './redis/redis.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PromoModule } from './promo/promo.module';
import { AdminModule } from './admin/admin.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    UsersModule,
    SpinModule,
    ProductsModule,
    OrdersModule,
    PromoModule,
    AdminModule,
    BotModule,
  ],
})
export class AppModule {}