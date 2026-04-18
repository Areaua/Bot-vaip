import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  async getOrCreate(telegramId: bigint, username?: string, firstName?: string, referralCode?: string) {
    const existing = await this.prisma.user.findUnique({ where: { telegramId } });

    if (existing) {
      return this.prisma.user.update({ where: { telegramId }, data: { username, firstName } });
    }

    // Знайти реферера
    let referredById: number | undefined;
    if (referralCode) {
      const referrer = await this.prisma.user.findFirst({ where: { referralCode } });
      if (referrer) {
        referredById = referrer.id;
        // Бонус рефереру +50 балів
        await this.prisma.user.update({
          where: { id: referrer.id },
          data: { bonusBalance: { increment: 50 } },
        });
        // +1 бонусний спін рефереру
        const refBonusKey = `spin:bonus:${referrer.id}`;
        const cur = parseInt((await this.redis.get(refBonusKey)) ?? '0');
        await this.redis.set(refBonusKey, String(cur + 1), 86400 * 30);
      }
    }

    // Новий юзер: +50 балів за реєстрацію
    return this.prisma.user.create({
      data: { telegramId, username, firstName, bonusBalance: 50, referredById },
    });
  }

  async claimDailyBonus(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) throw new BadRequestException('Користувач не знайдений');

    const key = `daily:bonus:${user.id}:${this.todayKey()}`;
    const already = await this.redis.get(key);
    if (already) return { claimed: false, bonusBalance: user.bonusBalance };

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { bonusBalance: { increment: 10 } },
    });
    await this.redis.set(key, '1', 86400);
    return { claimed: true, bonus: 10, bonusBalance: updated.bonusBalance };
  }

  async getProfile(telegramId: bigint) {
    return this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        spinLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { prize: true },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { items: { include: { product: { select: { name: true } } } } },
        },
        promoCodes: {
          where: { isUsed: false, expiresAt: { gt: new Date() } },
        },
        referrals: {
          select: { id: true, username: true, firstName: true, createdAt: true },
        },
      },
    });
  }
}
